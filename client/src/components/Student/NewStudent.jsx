import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './NewStudent.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const NewStudent = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
    grade: '',
    contact: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contact') {
      if (value === '' || /^[0-9\b]+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/student', formData);

      if (response.status === 201) {
        alert('Student created successfully');
        setFormData({
          username: '',
          password: '',
          email: '',
          firstname: '',
          lastname: '',
          grade: '',
          contact: ''
        });
      } else {
        setError('Failed to create student');
      }
    } catch (err) {
      setError('Error during student creation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/Student');
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');
  
  return (
    <div>
      <Header type={'dashboard'} action={'Logout'} />
      <Navbar />
      <SectionHeader section={'New Student'} />

      <div className='main'>
        <button className='back-btn' onClick={handleBack}>← Back to Student List</button>
        <form className='student-form' onSubmit={handleSubmit}>
          {['username', 'password', 'email', 'firstname', 'lastname', 'grade', 'contact'].map((field) => (
            <div className='form-group' key={field}>
              <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                minLength={field === 'password' ? 8 : undefined}
              />
            </div>
          ))}
          {loading && <p>Saving...</p>}
          {error && <p className="error">{error}</p>}
          <button type='submit' className='submit-btn-1' disabled={!isFormValid}>Create Student</button>
        </form>
      </div>
    </div>
  );
};
