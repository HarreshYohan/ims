import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './NewStaff.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const NewStaff = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/staff', {
        username,
        password,
        email,
        title,
        firstname: firstName,
        lastname: lastName,
        contact,
        position,
        salary,
      });

      if (response.status === 201) {
        navigate('/staff');
      } else {
        setError('Failed to create staff');
      }
    } catch (error) {
      setError('Error during staff creation');
      console.error('Error during staff creation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'New Staff'} />
      <div className='main'>
        <form className='student-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Username:</label>
            <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Password:</label>
            <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Email:</label>
            <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Title:</label>
            <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>First Name:</label>
            <input type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Last Name:</label>
            <input type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Contact:</label>
            <input type='text' value={contact} onChange={(e) => setContact(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Position:</label>
            <input type='text' value={position} onChange={(e) => setPosition(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Salary:</label>
            <input type='number' value={salary} onChange={(e) => setSalary(e.target.value)} required />
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}

          <button type='submit' className='submit-btn-1'>Create Staff</button>
        </form>
      </div>
    </div>
  );
};
