import React from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';
import Image from '../../assets/home-bg.jpg';

export const Welcome = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='home' style={{ backgroundImage: 'url(' + Image + ')' }}>
      <div className="top-bar">
        <h1 className="header-name">IMS</h1>
        <div className="nav-buttons">
          <button className="ghost-button" onClick={() => scrollToSection('why-us')}>Why Us</button>
          <button className="ghost-button" onClick={() => scrollToSection('contact-us')}>Contact Us</button>
          <button className="ghost-button" onClick={() => scrollToSection('about-us')}>About Us</button>
          <button className="login-button" onClick={handleLogin}>Log In</button>
        </div>
      </div>
      <div id="why-us" className="section">
        <h2>Why Us</h2>
        <p>Content for Why Us section.</p>
        <img src="C:\Users\Mishtika\Downloads\assign\ims\client\src\images\welcom pg\img_1 about.jpeg" className='img_1'></img>
      </div>
      <div id="contact-us" className="section">
        <h2>Contact Us</h2>
        <p>Content for Contact Us section.</p>
      </div>
      <div id="about-us" className="section">
        <h2>About Us</h2>
        <p>Content for About Us section.</p>
      </div>
    </div>
  );
};
