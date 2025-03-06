import React, { useState } from 'react';
import Auth from './components/Auth';
import MainPage from './components/MainPage';
import WikiPage from './components/WikiPage';
import ContentPage from './components/ContentPage';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [pageInfo, setPageInfo] = useState({page: 'main'});
  const [dataStore, setDataStore] = useState({});

  if (!user) return <div className='app'><Auth onSignIn={setUser} /></div>;
  const { page } = pageInfo;
  if (page === 'main') return <div className='app'><MainPage user={user}
    pageInfo={pageInfo} setPageInfo={setPageInfo} dataStore={dataStore} setDataStore={setDataStore} /></div>;
  if (page === 'wiki') return <div className='app'><WikiPage user={user}
    pageInfo={pageInfo} setPageInfo={setPageInfo} dataStore={dataStore} setDataStore={setDataStore} /></div>;
  if (page === 'content') return <div className='app'><ContentPage user={user}
    pageInfo={pageInfo} setPageInfo={setPageInfo} dataStore={dataStore} setDataStore={setDataStore} /></div>;
  return <div className='app'><p>Invalid page</p></div>;
};

export default App;
