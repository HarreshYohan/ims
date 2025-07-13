import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setErrorMsg(''); // Clear previous error

  try {
    const res = await api.post('/login', { email, password });
    const token = res.data.token;

    if (token) {
      localStorage.setItem('token', token);
      console.log("here")
      navigate('/dashboard');
    } else {
      setErrorMsg('Login failed: No token received.');
    }
  } catch (err) {
    const message = err.response?.data?.message || 'Network error. Please try again.';
    setErrorMsg(message);
    setTimeout(() => setErrorMsg(''), 3000);
  }
};

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">🎓 Student Portal</h2>
        <p className="login-subtitle">Login to continue</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button">Login</button>

          {/* ✅ Error Message */}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
        </form>

        <p className="login-hint">Hint: student1@gmail.com / 1234</p>
      </div>
    </div>
  );
}

export default Login;
