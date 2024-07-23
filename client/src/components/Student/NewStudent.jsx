import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './NewStudent.css'; // Import your CSS file for styling
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';


export const NewStudent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
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
      const response = await api.post('/api/student', {
        username,
        password,
        email,
        firstname: firstName,
        lastname: lastName,
        grade,
        contact,
      });

      if (response.status === 201) {
        navigate('/Student');
      } else {
        setError('Failed to create Student');
      }
    } catch (error) {
      setError('Error during Student creation');
      console.error('Error during Student creation:', error);
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
            <label htmlFor='password'>Password:</label>
            <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                }}
                minLength={8} // Ensure HTML5 validation for minimum length
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
            <label htmlFor='firstName'>First Name:</label>
            <input
              type='text'
              id='userName'
              value={userName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <br></br>
          <div className='form-group'>
            <label htmlFor='email'>Email:</label><br></br>
            <input
              type='text'
              id='email'
              value={email}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <br></br>
          <div className='form-group'>
            <label htmlFor='passcode'>Password:</label><br></br>
            <input
              type='text'
              id='passcode'
              value={password}
              onChange={(e) => setGrade(e.target.value)}
              required
            />
          </div>
          <br></br>
          <div className='form-group'>
            <label htmlFor='firstName'>FirstName:</label><br></br>
             <input
              type='text'
              id='firstName'
              value={firstName}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <br></br>
          <div className='form-group'>
            <label htmlFor='lastName'>LastName:</label><br></br>
            <input
              type='text'
              id='lastName'
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <br></br>
          <div className='form-group'>
            <label htmlFor='contact'>Contact:</label><br></br>
            <input
              type='text'
              id='contact'
              value={contact}
              onChange={(e) => {
                const re = /^[0-9\b]+$/; // Regular expression to allow only numbers
                if (e.target.value === '' || re.test(e.target.value)) {
                  setContact(e.target.value);
                }}}
              required
            />
          </div>
          <br></br>
          <div className='form-group'>
            <label htmlFor='lastName'>Grade:</label><br></br>
            <input
              type='text'
              id='LName'
              value={lastName}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <br></br>
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          <button type='submit' className='submit-btn'>
            <b>Proceed</b>
          </button>
        </form>
      </div>
    </div>
  );
};