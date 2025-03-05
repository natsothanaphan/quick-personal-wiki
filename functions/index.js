require('dotenv').config({ path: ['.env', '.env.default'] });
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const express = require('express');

setGlobalOptions({ region: 'asia-southeast1' });
initializeApp();
const db = getFirestore();

const app = express();
app.use(express.json());

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
app.use(authenticate);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

const createTimeFields = () => ({
  createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
const updateTimeFields = () => ({ updatedAt: FieldValue.serverTimestamp() });
const docToData = (doc) => {
  const data = doc.data();
  return { id: doc.id, ...data,
    createdAt: data.createdAt.toDate(), updatedAt: data.updatedAt.toDate() };
};

const getWikisColl = (uid) => db.collection('users').doc(uid).collection('wikis');
const getPagesColl = (uid, wikiId) => getWikisColl(uid).doc(wikiId).collection('pages');

app.get('/api/wikis', async (req, res) => {
  const uid = req.uid;
  try {
    const wikisSnapshot = await getWikisColl(uid).orderBy('createdAt', 'desc').get();
    const wikis = wikisSnapshot.docs.map(docToData);
    return res.json(wikis);
  } catch (err) {
    logger.error('Error get /api/wikis:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/wikis', async (req, res) => {
  const uid = req.uid;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Wiki name is required' });
  try {
    const wikisRef = getWikisColl(uid);
    const existsQuery = await wikisRef.where('name', '==', name).get();
    if (!existsQuery.empty) return res.status(400).json({ error: 'Wiki with this name already exists' });
    const wikiData = { name, ...createTimeFields() };
    const newWikiRef = await wikisRef.add(wikiData);
    return res.status(201).json({ id: newWikiRef.id, ...wikiData });
  } catch (err) {
    logger.error('Error post /api/wikis:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.patch('/api/wikis/:wikiId', async (req, res) => {
  const uid = req.uid;
  const { wikiId } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Wiki name is required for update' });
  try {
    const wikiRef = getWikisColl(uid).doc(wikiId);
    const wikiDoc = await wikiRef.get();
    if (!wikiDoc.exists) return res.status(404).json({ error: 'Wiki not found' });
    const wikisRef = getWikisColl(uid);
    const existsQuery = await wikisRef.where('name', '==', name).get();
    let duplicate = false;
    existsQuery.docs.filter((doc) => doc.id !== wikiId).forEach((doc) => { duplicate = true; });
    if (duplicate) return res.status(400).json({ error: 'Another wiki with this name already exists' });
    await wikiRef.update({ name, ...updateTimeFields() });
    const updatedWiki = await wikiRef.get();
    return res.json(docToData(updatedWiki));
  } catch (err) {
    logger.error('Error patch /api/wikis/:wikiId:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/wikis/:wikiId', async (req, res) => {
  const uid = req.uid;
  const { wikiId } = req.params;
  try {
    const wikiRef = getWikisColl(uid).doc(wikiId);
    const wikiDoc = await wikiRef.get();
    if (!wikiDoc.exists) return res.status(404).json({ error: 'Wiki not found' });

    const batch = db.batch();
    const pagesSnapshot = await getPagesColl(uid, wikiId).get();
    pagesSnapshot.forEach((doc) => { batch.delete(doc.ref); });
    batch.delete(wikiRef);
    await batch.commit();
    return res.status(204).send();
  } catch (err) {
    logger.error('Error delete /api/wikis/:wikiId:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/wikis/:wikiId/pages', async (req, res) => {
  const uid = req.uid;
  const { wikiId } = req.params;
  try {
    const pagesSnapshot = await getPagesColl(uid, wikiId).select('title', 'createdAt', 'updatedAt')
      .orderBy('createdAt', 'desc').get();
    const pages = pagesSnapshot.docs.map(docToData);
    return res.json(pages);
  } catch (err) {
    logger.error('Error get /api/wikis/:wikiId/pages:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/wikis/:wikiId/pages', async (req, res) => {
  const uid = req.uid;
  const { wikiId } = req.params;
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
  try {
    const pagesRef = getPagesColl(uid, wikiId);
    const existsQuery = await pagesRef.where('title', '==', title).get();
    if (!existsQuery.empty) return res.status(400).json({ error: 'Page with this title already exists' });
    const newPageData = { title, content, ...createTimeFields() };
    const newPageRef = await pagesRef.add(newPageData);
    return res.status(201).json({ id: newPageRef.id, ...newPageData });
  } catch (err) {
    logger.error('Error post /api/wikis/:wikiId/pages:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.patch('/api/wikis/:wikiId/pages/:pageId', async (req, res) => {
  const uid = req.uid;
  const { wikiId, pageId } = req.params;
  const { title, content } = req.body;
  if (!title && !content) return res.status(400).json({ error: 'Nothing to update' });
  try {
    const pageRef = getPagesColl(uid, wikiId).doc(pageId);
    const pageDoc = await pageRef.get();
    if (!pageDoc.exists) return res.status(404).json({ error: 'Page not found' });
    const updateData = { ...updateTimeFields() };
    if (title) {
      const existsQuery = await getPagesColl(uid, wikiId).where('title', '==', title).get();
      let duplicate = false;
      existsQuery.docs.filter((doc) => doc.id !== pageId).forEach((doc) => { duplicate = true; });
      if (duplicate) return res.status(400).json({ error: 'Another page with this title already exists' });
      updateData.title = title;
    }
    if (content) updateData.content = content;

    await pageRef.update(updateData);
    const updatedDoc = await pageRef.get();
    return res.json(docToData(updatedDoc));
  } catch (err) {
    logger.error('Error patch /api/wikis/:wikiId/pages/:pageId:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/wikis/:wikiId/pages/:pageId', async (req, res) => {
  const uid = req.uid;
  const { wikiId, pageId } = req.params;
  try {
    const pageRef = getPagesColl(uid, wikiId).doc(pageId);
    const pageDoc = await pageRef.get();
    if (!pageDoc.exists) return res.status(404).json({ error: 'Page not found' });
    await pageRef.delete();
    return res.status(204).send();
  } catch (err) {
    logger.error('Error delete /api/wikis/:wikiId/pages/:pageId:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

exports.app = onRequest(app);
