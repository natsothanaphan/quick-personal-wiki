const authHeader = (token) => ({ 'Authorization': `Bearer ${token}` });
const jsonHeader = () => ({ 'Content-Type': 'application/json' });

const ping = async (token) => {
  console.log('api ping start', {});
  const resp = await fetch(`/api/ping`, {
    headers: authHeader(token),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api ping error', { errData });
    throw new Error(errData.error || 'Failed api ping');
  }
  const data = await resp.text();
  console.log('api ping done', { data });
  return data;
};

const fetchWikis = async (token) => {
  console.log('api fetchWikis start', {});
  const resp = await fetch(`/api/wikis`, {
    headers: authHeader(token),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api fetchWikis error', { errData });
    throw new Error(errData.error || 'Failed api fetchWikis');
  }
  const data = await resp.json();
  console.log('api fetchWikis done', { data });
  return data;
};

const createWiki = async (token, { name }) => {
  console.log('api createWiki start', { name });
  const resp = await fetch(`/api/wikis`, {
    method: 'POST',
    headers: {...authHeader(token), ...jsonHeader()},
    body: JSON.stringify({ name }),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api createWiki error', { errData });
    throw new Error(errData.error || 'Failed api createWiki');
  }
  const data = await resp.json();
  console.log('api createWiki done', { data });
  return data;
};
const updateWiki = async (token, wikiId, { name }) => {
  console.log('api updateWiki start', { wikiId, name });
  const resp = await fetch(`/api/wikis/${wikiId}`, {
    method: 'PATCH',
    headers: {...authHeader(token), ...jsonHeader()},
    body: JSON.stringify({ name }),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api updateWiki error', { errData });
    throw new Error(errData.error || 'Failed api updateWiki');
  }
  const data = await resp.json();
  console.log('api updateWiki done', { data });
  return data;
};
const deleteWiki = async (token, wikiId) => {
  console.log('api deleteWiki start', { wikiId });
  const resp = await fetch(`/api/wikis/${wikiId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api deleteWiki error', { errData });
    throw new Error(errData.error || 'Failed api deleteWiki');
  }
  console.log('api deleteWiki done', {});
};

const fetchPages = async (token, wikiId) => {
  console.log('api fetchPages start', { wikiId });
  const resp = await fetch(`/api/wikis/${wikiId}/pages`, {
    headers: authHeader(token),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api fetchPages error', { errData });
    throw new Error(errData.error || 'Failed api fetchPages');
  }
  const data = await resp.json();
  console.log('api fetchPages done', { data });
  return data;
};

const createPage = async (token, wikiId, { title, content }) => {
  console.log('api createPage start', { wikiId, title, content });
  const resp = await fetch(`/api/wikis/${wikiId}/pages`, {
    method: 'POST',
    headers: {...authHeader(token), ...jsonHeader()},
    body: JSON.stringify({ title, content }),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api createPage error', { errData });
    throw new Error(errData.error || 'Failed api createPage');
  }
  const data = await resp.json();
  console.log('api createPage done', { data });
  return data;
};
const updatePage = async (token, wikiId, pageId, { title, content }) => {
  console.log('api updatePage start', { wikiId, pageId, title, content });
  const resp = await fetch(`/api/wikis/${wikiId}/pages/${pageId}`, {
    method: 'PATCH',
    headers: {...authHeader(token), ...jsonHeader()},
    body: JSON.stringify({ title, content }),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api updatePage error', { errData });
    throw new Error(errData.error || 'Failed api updatePage');
  }
  const data = await resp.json();
  console.log('api updatePage done', { data });
  return data;
};
const deletePage = async (token, wikiId, pageId) => {
  console.log('api deletePage start', { wikiId, pageId });
  const resp = await fetch(`/api/wikis/${wikiId}/pages/${pageId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api deletePage error', { errData });
    throw new Error(errData.error || 'Failed api deletePage');
  }
  console.log('api deletePage done', {});
};

export default {
  ping,
  fetchWikis,
  createWiki, updateWiki, deleteWiki,
  fetchPages,
  createPage, updatePage, deletePage,
};
