import React, { useState, useEffect } from 'react';
import './MainPage.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const MainPage = ({ user, pageInfo, setPageInfo, wikisData, setWikisData }) => {
  const [fullWikis, setFullWikis] = useState([]);
  const [wikis, setWikis] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingWiki, setEditingWiki] = useState({id: null, name: ''});
  const [newWiki, setNewWiki] = useState({name: ''});

  const fetchWikis = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const data = await api.fetchWikis(idToken);
      setWikisData((prev) => {
        const curr = {...prev, wikis: {}};
        data.forEach((wiki) => { curr.wikis[wiki.id] = {...prev.wikis?.[wiki.id], ...wiki}; });
        return curr;
      });
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWiki = (e, wikiId) => {
    e.preventDefault();
    setPageInfo({page: 'wiki', wikiId});
  };
  const handleEditWiki = (wiki) => { setEditingWiki({id: wiki.id, name: wiki.name}); };
  const handleDeleteWiki = async (wikiId, name) => {
    if (!window.confirm(`Are you sure you want to delete wiki: ${name}?`)) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteWiki(idToken, wikiId);
      fetchWikis();
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleSaveWiki = async (wikiId) => {
    try {
      const idToken = await user.getIdToken();
      await api.updateWiki(idToken, wikiId, editingWiki.name);
      setEditingWiki({id: null, name: ''});
      fetchWikis();
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleCancelEditWiki = () => { setEditingWiki({id: null, name: ''}); };

  const handleCreateWiki = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      await api.createWiki(idToken, newWiki.name);
      setNewWiki({name: ''});
      fetchWikis();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  useEffect(() => { setFullWikis(Object.values(wikisData.wikis ?? {}).sort((a, b) => a.name.localeCompare(b.name))); }, [wikisData]);
  useEffect(() => { setWikis(fullWikis.filter((wiki) => wiki.name.includes(search))); }, [fullWikis, search]);
  useEffect(() => { if (!fullWikis.length) fetchWikis(); }, []);

  return <>
    <div className='wikis-search'>
      <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    <div className='wikis-list'>
      {loading && <p>Loading...</p>}
      {!loading && <ul>{wikis.map((wiki) => <li key={wiki.id}>
        {editingWiki.id !== wiki.id && <>
          <a href='#' onClick={(e) => handleSelectWiki(e, wiki.id)}>{wiki.name}</a>{' '}
          <button onClick={() => handleEditWiki(wiki)} title='Edit'>✏️</button>{' '}
          <button onClick={() => handleDeleteWiki(wiki.id, wiki.name)} title='Delete'>🗑️</button>
        </>}
        {editingWiki.id === wiki.id && <>
          <input type='text' placeholder='label' value={editingWiki.name}
            onChange={(e) => setEditingWiki({...editingWiki, name: e.target.value})} required />
          <div>
            <button onClick={() => handleSaveWiki(wiki.id)} title='Save'>💾</button>{' '}
            <button onClick={handleCancelEditWiki} title='Cancel'>❌</button>
          </div>
        </>}
      </li>)}</ul>}
    </div>
    <div className='create-wiki'>
      <h3>Create Wiki</h3>
      <form onSubmit={handleCreateWiki}>
        <input type='text' placeholder='name' value={newWiki.name}
          onChange={(e) => setNewWiki({...newWiki, name: e.target.value})} required />
        <button type='submit' title='Create'>✨</button>
      </form>
    </div>
  </>;
};

export default MainPage;
