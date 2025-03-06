import React, { useState, useEffect, useMemo } from 'react';
import './ContentPage.css';
import { BackButton, ReloadButton, EditButton, SaveButton, CancelButton } from './Buttons';
import api from '../api.js';
import markup from '../markup/markup.js';
import { alertAndLogErr } from '../utils.js';

const ContentPage = ({ user, pageInfo, setPageInfo, wikisData, setWikisData }) => {
  const { wikiId, pageId } = pageInfo;

  const backButton = <BackButton onClick={() => setPageInfo({page: 'wiki', wikiId})} />;

  if (wikisData.wikis?.[wikiId]?.pages?.[pageId] === undefined) return <>
    {backButton}
    <p>Page not found!</p>
  </>;

  const [pagesTitleToId, setPagesTitleToId] = useState({});
  const [pageData, setPageData] = useState({title: '', content: ''});
  const [loading, setLoading] = useState(false);

  const [editingData, setEditingData] = useState({editing: false, content: ''});

  const fetchPage = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const data = await api.fetchPage(idToken, wikiId, pageId);
      setWikisData((prev) => {
        const curr = {...prev, wikis: {...prev.wikis, [wikiId]: {...prev.wikis?.[wikiId],
          pages: {...prev.wikis?.[wikiId].pages, [pageId]: {...prev.wikis?.[wikiId].pages?.[pageId], ...data}}}}};
        return curr;
      });
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = (e, title) => {
    e.preventDefault();
    const pageId = pagesTitleToId[title];
    if (!pageId) {
      alert(`Page not found: ${title}`);
      return;
    }
    setPageInfo({page: 'content', wikiId, pageId});
  };
  const handleEdit = () => { setEditingData({editing: true, content: pageData.content}); };
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      await api.updatePage(idToken, wikiId, pageId, { content: editingData.content });
      setEditingData({editing: false, content: ''});
      fetchPage();
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleCancelEdit = () => { setEditingData({editing: false, content: ''}); };

  const _pages = wikisData.wikis?.[wikiId]?.pages;
  const _page = _pages?.[pageId];
  useEffect(() => { if (_page?.title === undefined || _page?.content === undefined) fetchPage(); }, [_page]);
  useEffect(() => { setPagesTitleToId(Object.fromEntries(Object.entries(_pages ?? {}).map(([id, page]) => [page.title, id]))); }, [_pages]);
  useEffect(() => { setPageData({title: _page?.title ?? '', content: _page?.content ?? ''}); }, [_page]);

  const markupContent = useMemo(() => markup.parse(pageData.content, handleSelectPage), [pageData.content]);

  return <>
    <div>{backButton}{' '}<ReloadButton onClick={fetchPage} /></div>
    <h2>{pageData.title}</h2>
    <div className='page-data'>
      {loading && <p>Loading...</p>}
      {!loading && !editingData.editing && <>
        <pre>{markupContent.map((part) => <>
          {part.type === 'text' && part.text}
          {part.type === 'link' && <a href='#' onClick={(e) => handleSelectPage(e, part.url)} title={part.url}>{part.text}</a>}
        </>)}</pre>
        <EditButton onClick={handleEdit} />
      </>}
      {!loading && editingData.editing && <form onSubmit={handleSave}>
        <textarea placeholder='content' value={editingData.content} rows={12}
          onChange={(e) => setEditingData({...editingData, content: e.target.value})} required />
        <div>
          <SaveButton type='submit'/>{' '}
          <CancelButton type='button' onClick={handleCancelEdit} />
        </div>
      </form>}
    </div>
  </>;
};

export default ContentPage;
