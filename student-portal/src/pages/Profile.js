import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Profile() {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    api.put('/profile', profile).then(() => alert("Updated!"));
  };

  return (
    <div>
      <h3>Edit Profile</h3>
      <input name="name" value={profile.name || ''} onChange={handleChange} />
      <input name="email" value={profile.email || ''} onChange={handleChange} />
      <button onClick={saveProfile}>Save</button>
    </div>
  );
}

export default Profile;
