import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './NewClassroom.css'; // Import your CSS file for styling
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const NewClassroom = () => {
  const [name, setname] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/classroom', {
        name,
        capacity,
      });

      if (response.status === 201) {
        navigate('/classroom');
      } else {
        setError('Failed to create classroom');
      }
    } catch (error) {
      setError('Error during classroom creation');
      console.error('Error during classroom creation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'New classroom'} />

      <div className='main'>
        <form className='student-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='name'>Classroom Name:</label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setname(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='capacity'>Capacity:</label>
            <input
              type='text'
              id='capacity'
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>
          
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          <button type='submit' className='submit-btn'>
            Create classroom
          </button>
        </form>
      </div>
    </div>
  );
};