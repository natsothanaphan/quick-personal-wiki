import React from 'react';
import './ContentPage.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const ContentPage = ({ user, pageInfo, setPageInfo, wikisData, setWikisData }) => {
  const { wikiId, pageId } = pageInfo;
  return <div>ContentPage</div>;
};

export default ContentPage;
