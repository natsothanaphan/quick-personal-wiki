import React from 'react';
import './Modal.css';

const Modal = ({ children, isOpen, setIsOpen }) => {
  if (!isOpen) return null;
  return <div className='modal-overlay'>
    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
      <button className='modal-close' onClick={() => setIsOpen(false)} title='Close'>❌</button>
      {children}
    </div>
  </div>;
};

export default Modal;
