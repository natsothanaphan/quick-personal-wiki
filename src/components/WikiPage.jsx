import React, { useState, useEffect } from 'react';
import { BackButton, ReloadButton, EditButton, DeleteButton, SaveButton, CancelButton, CreateButton } from './Buttons';
import './WikiPage.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const WikiPage = ({ user, pageInfo, setPageInfo, wikisData, setWikisData }) => {
  const backButton = <BackButton onClick={() => setPageInfo({page: 'main'})} />;

  const { wikiId } = pageInfo;
  const wiki = wikisData.wikis?.[wikiId];
  if (!wiki) return <>
    {backButton}
    <p>Wiki not found!</p>
  </>;

  const [fullPages, setFullPages] = useState([]);
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingPage, setEditingPage] = useState({id: null, title: ''});
  const [newPage, setNewPage] = useState({title: ''});

  const fetchPages = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const data = await api.fetchPages(idToken, wikiId);
      setWikisData((prev) => {
        const curr = {...prev, wikis: {...prev.wikis, [wikiId]: {...prev.wikis?.[wikiId], pages: {}}}};
        data.forEach((page) => { curr.wikis[wikiId].pages[page.id] = {...prev.wikis?.[wikiId].pages?.[page.id], ...page}; });
        return curr;
      });
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = (e, pageId) => {
    e.preventDefault();
    setPageInfo({page: 'page', pageId});
  };
  const handleEditPage = (page) => { setEditingPage({id: page.id, title: page.title}); };
  const handleDeletePage = async (pageId, title) => {
    if (!window.confirm(`Are you sure you want to delete page: ${title}?`)) return;
    try {
      const idToken = await user.getIdToken();
      await api.deletePage(idToken, wikiId, pageId);
      fetchPages();
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleSavePage = async (pageId) => {
    try {
      const idToken = await user.getIdToken();
      await api.updatePage(idToken, wikiId, pageId, { title: editingPage.title });
      setEditingPage({id: null, title: ''});
      fetchPages();
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleCancelEditPage = () => { setEditingPage({id: null, title: ''}); };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const content = 'Init.';
      await api.createPage(idToken, wikiId, { title: newPage.title, content });
      setNewPage({title: ''});
      fetchPages();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  useEffect(() => { if (wikisData.wikis?.[wikiId]?.pages === undefined) fetchPages(); }, [wikisData]);
  useEffect(() => { setFullPages(Object.values(wikisData.wikis?.[wikiId]?.pages ?? {}).sort((a, b) => a.title.localeCompare(b.title))); }, [wikisData]);
  useEffect(() => { setPages(fullPages.filter((page) => page.title.includes(search))); }, [fullPages, search]);

  return <>
    <div>{backButton}{' '}<ReloadButton onClick={fetchPages} /></div>
    <h2>{wiki.name}</h2>
    <div className='pages-search'>
      <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    <div className='pages-list'>
      {loading && <p>Loading...</p>}
      {!loading && <ul>{pages.map((page) => <li key={page.id}>
        {editingPage.id !== page.id && <>
          <a href='#' onClick={(e) => handleSelectPage(e, page.id)}>{page.title}</a>{' '}
          <EditButton onClick={() => handleEditPage(page)} />{' '}
          <DeleteButton onClick={() => handleDeletePage(page.id, page.title)} />
        </>}
        {editingPage.id === page.id && <>
          <input type='text' placeholder='title' value={editingPage.title}
            onChange={(e) => setEditingPage({...editingPage, title: e.target.value})} required />
          <div>
            <SaveButton onClick={() => handleSavePage(page.id)} />{' '}
            <CancelButton onClick={handleCancelEditPage} />
          </div>
        </>}
      </li>)}</ul>}
    </div>
    <div className='create-page'>
      <h3>Create Page</h3>
      <form onSubmit={handleCreatePage}>
        <input type='text' placeholder='title' value={newPage.title}
          onChange={(e) => setNewPage({...newPage, title: e.target.value})} required />
        <CreateButton />
      </form>
    </div>
  </>;
};

export default WikiPage;
