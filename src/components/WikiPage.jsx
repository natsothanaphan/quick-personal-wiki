import React from 'react';
import './WikiPage.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const WikiPage = ({ user, pageInfo, setPageInfo, wikisData, setWikisData }) => {
  const { wikiId } = pageInfo;
  return <div>WikiPage</div>;
};

export default WikiPage;
