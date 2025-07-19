import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState({});
  const [originalProfile, setOriginalProfile] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          await fetchProfile(decoded.user_id); // Assuming user_id is in the token
        } catch (err) {
          console.error('Invalid token:', err);
        }
      }
    };

    fetchData();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`/profile/${userId}`);
      const data = response.data;
      setProfile(data);
      setOriginalProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error?.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const isChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile);

    const validateFields = () => {
    if (!profile.username || profile.username.trim().length < 1) {
      return 'Username must contain at least one character.';
    }

    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return 'Invalid email format.';
    }

    if (!profile.firstname || profile.firstname.trim() === '') {
      return 'First name cannot be empty.';
    }
    if (!/[a-zA-Z]{3,}/.test(profile.firstname)) {
      return 'First name must have at least 3 letters and cannot be all numbers.';
    }
    
    if (!profile.lastname || profile.lastname.trim() === '') {
      return 'Last name cannot be empty.';
    }
    if (!/[a-zA-Z]{3,}/.test(profile.lastname)) {
      return 'Last name must have at least 3 letters and cannot be all numbers.';
    }

    if (!profile.contact || !/^\d{10}$/.test(profile.contact)) {
      return 'Contact number must be exactly 10 digits.';
    }

    return null;
  };
  const saveProfile = async () => {
    const validationError = validateFields();
    if (validationError) {
      alert('❌ Failed to update profile.'+ validationError);
      return;
    }
    try {
      await api.post(`/profile/${profile.id}`, profile);
      alert('✅ Profile Updated!');
      setOriginalProfile(profile);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('❌ Failed to update profile.');
    }
  };


  return (
    <div className="profile-container">
      <h2>👤 Edit Your Profile</h2>

      <div className="profile-form">
        <label>
          First Name:
          <input
            type="text"
            name="firstname"
            value={profile.firstname || ''}
            onChange={handleChange}
            placeholder="Enter first name"
          />
        </label>

        <label>
          Last Name:
          <input
            type="text"
            name="lastname"
            value={profile.lastname || ''}
            onChange={handleChange}
            placeholder="Enter last name"
          />
        </label>

        <label>
          Full Name:
          <input
            type="text"
            name="username"
            value={profile.username || ''}
            onChange={handleChange}
            placeholder="Username"
          />
        </label>

        <label>
          Contact Number:
          <input
            type="text"
            name="contact"
            value={profile.contact || ''}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </label>

        <label>
          Email (Read-only):
          <input
            type="email"
            value={profile.email || ''}
            disabled
          />
        </label>

        <label>
          Grade (Read-only):
          <input
            type="text"
            value={profile.grade || ''}
            disabled
          />
        </label>

        <button
          className="save-button"
          onClick={saveProfile}
          disabled={!isChanged}
        >
          💾 Save Changes
        </button>
      </div>
    </div>
  );
}

export default Profile;
