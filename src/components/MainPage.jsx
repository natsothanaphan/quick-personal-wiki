import React, { useState } from 'react';
import Modal from './Modal';
import './MainPage.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const MainPage = ({ user, pageInfo, setPageInfo, dataStore, setDataStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return <div>
    <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
    <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen}>
      <p>Hello</p>
    </Modal>
  </div>;
};

export default MainPage;
