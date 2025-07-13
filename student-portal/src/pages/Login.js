import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'student1@gmail.com' && password === '1234') {
      localStorage.setItem('token', 'faketoken123');
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
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
        </form>

        <p className="login-hint">Hint: student1@gmail.com / 1234</p>
      </div>
    </div>
  );
}

export default Login;
