import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
// import './NewStudent.css'; // Create a new CSS file for styling
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const NewStudent = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/student/create', {
        firstname: firstName,
        lastname: lastName,
        grade,
        contact,
      });

      if (response.status === 201) {
        navigate('/students'); // Redirect to the students list page
      } else {
        setError('Failed to create student');
      }
    } catch (error) {
      setError('Error during student creation');
      console.error('Error during student creation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'New Student'} />

      <div className='main'>
        <form className='student-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='firstName'>First Name:</label>
            <input
              type='text'
              id='firstName'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='lastName'>Last Name:</label>
            <input
              type='text'
              id='lastName'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='grade'>Grade:</label>
            <input
              type='text'
              id='grade'
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='contact'>Contact:</label>
            <input
              type='text'
              id='contact'
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          <button type='submit' className='submit-btn'>
            Create Student
          </button>
        </form>
      </div>
    </div>
  );
};
