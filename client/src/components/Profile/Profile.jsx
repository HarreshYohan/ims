import React, { useEffect, useState } from 'react';
import './Profile.css';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { Message } from '../Message/Message.jsx';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem('authToken');

  const handleClose = () => setMessage(null);

  useEffect(() => {
    if (token) {
      const { user_id } = jwtDecode(token);
      fetchProfile(user_id);
    }
  }, [token]);

  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`//profile/${userId}`);
      const data = response.data;
      setRole(data.user_type || 'STUDENT');
      setUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error?.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!user.username || user.username.trim().length < 1) {
      return 'Username must contain at least one character.';
    }

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      return 'Invalid email format.';
    }

    if (!user.firstname || user.firstname.trim() === '') {
      return 'First name cannot be empty.';
    }
    if (!/[a-zA-Z]{3,}/.test(user.firstname)) {
      return 'First name must have at least 3 letters and cannot be all numbers.';
    }
    
    if (!user.lastname || user.lastname.trim() === '') {
      return 'Last name cannot be empty.';
    }
    if (!/[a-zA-Z]{3,}/.test(user.lastname)) {
      return 'Last name must have at least 3 letters and cannot be all numbers.';
    }

    if (!user.contact || !/^\d{10}$/.test(user.contact)) {
      return 'Contact number must be exactly 10 digits.';
    }

    return null;
  };

  const handleUpdate = async () => {
    const validationError = validateFields();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    try {
      await api.post(`//profile/${user.id}`, user);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      console.error('Update failed:', err);
      const errorText = err?.response?.data?.error || 'An unexpected error occurred';
      setMessage({ type: 'error', text: errorText });
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Profile" is_create />

      <div className="main">
        <div className="user-profile">
          <h2>User Profile</h2>

          {message && (
            <Message type={message.type} text={message.text} onClose={handleClose} />
          )}

          <div className="profile-form">
            <label>
              User ID:
              <input type="text" value={user.user_id || user.id} disabled />
            </label>

            <label>
              Role:
              <input type="text" value={role} disabled />
            </label>

            <label>
              Username:
              <input
                type="text"
                name="username"
                value={user.username || ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                name="email"
                value={user.email || ''}
                onChange={handleChange}
              />
            </label>

            <label>
              First Name:
              <input
                type="text"
                name="firstname"
                value={user.firstname || ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Last Name:
              <input
                type="text"
                name="lastname"
                value={user.lastname || ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Contact:
              <input
                type="text"
                name="contact"
                value={user.contact || ''}
                onChange={handleChange}
              />
            </label>

            <button onClick={handleUpdate}>Update Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};
