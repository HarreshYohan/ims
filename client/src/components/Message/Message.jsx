import React from 'react';
import './Message.css';

export const Message = ({ type, text, onClose }) => {
  return (
    <div className={`message ${type}`}>
      
      <p>{text} <button className="close-btn" onClick={onClose}>&times;</button></p>
    </div>
  );
};

