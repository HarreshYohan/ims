import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">StudentPortal</div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact Us</a>
          <Link to="/login" className="login-btn">Login</Link>
        </nav>
      </header>

      <section id="home" className="landing-section home-section">
        <h1>Welcome to Student & Tutor Hub</h1>
        <p>Empowering Learning. Connecting Tutors. Enabling Success.</p>
        <Link to="/login" className="cta-button">Get Started</Link>
      </section>

      <section id="about" className="landing-section about-section">
        <h2>About Us</h2>
        <p>At StudentPortal, we bring together passionate tutors and curious students on a single platform.
           Whether you're seeking knowledge or sharing it, we make learning easy, engaging, and accessible.</p>
        <ul>
          <li>📚 Access to qualified tutors across subjects</li>
          <li>🎯 Personalized learning experience</li>
          <li>💬 Seamless communication between students and tutors</li>
          <li>📈 Track progress and performance</li>
        </ul>
      </section>

      <section id="contact" className="landing-section contact-section">
        <h2>Contact Us</h2>
        <p>Have questions? Reach out to our support team!</p>
        <div className="contact-details">
          <p>📧 Email: support@studentportal.com</p>
          <p>📞 Phone: +1 234 567 8901</p>
          <p>🏢 Address: 123 Learning Lane, Knowledge City, EduWorld</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2025 StudentPortal. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
