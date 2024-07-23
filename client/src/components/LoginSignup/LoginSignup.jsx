
import React, { useState } from 'react'
import './LoginSignup.css'
import email_icon from '../../assets/login_email.png'
import password_icon from '../../assets/login_password.png'
import home from '../../assets/home.png'
import '../../../src/style.css'
import { useNavigate } from 'react-router-dom';
import { Message } from '../Message/Message.jsx';


export const LoginSignup = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  const handleClose = () => {
    setMessage(null);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password , selectedRole})
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Server Token:', data.token);
      setMessage({ type: 'success', text: 'Login successful!' });
      const authToken = data.token;
      localStorage.setItem('authToken', authToken);
      navigate('/dashboard');
      
    } else {
      const error = await response.json();
      console.log('Login failed:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className='page-login-page'>
     
      
    <div className='container'>
    <a className="home-button"  href="/"><img src={home} className="home-button-img"  alt="" /></a>
      <div className="header">
        <div className="text">LOGIN</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <img src={email_icon} alt="" />
          <input type="text" placeholder='Email' onChange={(e) => setEmail(e.target.value)} required onKeyDown={handleKeyDown}/>
        </div>
        <div className="input">
          <img src={password_icon} alt="" />
          <input type="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)} required onKeyDown={handleKeyDown}/>
        </div>
        <div className="input">
        <select  onChange={(e) => handleRoleChange(e.target.value)} required>
        <option value="">Select Role</option>
        <option value="ADMIN">ADMIN</option>
        <option value="STUDENT">STUDENT</option>
        <option value="TUTOR">TUTOR</option>
        <option value="STAFF">STAFF</option>
      </select>
        </div>
        <div className="forgot-password">Forgot Password <span>Click here!</span></div>
        <div className="submit-container">
        <div className="submit" onClick={ handleLogin} >
          Log In
        </div>
      </div>
        {message &&  <Message type={message.type} text={message.text} onClose={handleClose} />}
      </div>
    </div>
    </div>
  )
}