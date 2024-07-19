import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SectionHeader.css';

export const SectionHeader = ({ section, is_create }) => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    switch (section){
      case 'Student':
        navigate('/new-student');
        break
      case 'Tutor':
        navigate('/new-tutor');
        break
      case 'Staff':
        navigate('/new-staff');
        break
    }
    
  };

  return (
    <div className='bar'>
      <p>{section}</p>
      {is_create && <button className="create-button" onClick={handleCreateClick}>Create</button>}
    </div>
  );
};
