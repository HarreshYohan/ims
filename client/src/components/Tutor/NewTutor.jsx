import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
// import './NewTutor.css'; // Create a new CSS file for styling
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const NewTutor = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [contact, setContact] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/tutor/create', {
        firstname: firstName,
        lastname: lastName,
        username,
        email,
        password,
        title,
        contact,
      });

      if (response.status === 201) {
        navigate('/tutor');
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
      <SectionHeader section={'New Tutor'} />

      <div className='main'>
        <form className='student-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='title'>Title:</label>
            <input
              type='text'
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
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
            <label htmlFor='username'>Username:</label>
            <input
              type='text'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='email'>Email:</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password:</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
