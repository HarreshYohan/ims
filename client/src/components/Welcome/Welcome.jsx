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
        <p>we are committed to providing an unparalleled learning experience tailored to meet the diverse needs of our students. <br/><br/>Our team of highly qualified and experienced educators brings a passion for teaching and a deep understanding of their subjects, ensuring that each student receives the best guidance and support. We offer a personalized approach to learning, with small class sizes and customized lesson plans designed to help students achieve their academic goals and build confidence in their abilities.</p>
      </div>
      <div id="contact-us" className="section">
        <h2>Contact Us</h2>
        <p>Wed love to hear from you! Whether you have questions, feedback, or need assistance, our team is here to help. Reach out to us through any of the following methods:<br/><br/>

Our Location<br/>
IMS Tuition Center<br/>
123 Learning Lane<br/>
Education City, EC 45678<br/>
Country<br/><br/><br/><br/>

Contact Details<br/>
Phone: +1 (555) 123-4567<br/>
Email: contact@imstuitioncenter.com<br/><br/><br/><br/>

Business Hours<br/><br/>
Monday - Friday: 9:00 AM - 6:00 PM<br/>
Saturday: 10:00 AM - 4:00 PM<br/>
Sunday: Closed</p>
      </div>
      <div id="about-us" className="section">
        <h2>About Us</h2>
        <p>we are dedicated to fostering a learning environment that empowers students to achieve their full potential. Our mission is to provide high-quality, personalized education tailored to each student's unique needs and learning style.<br/><br/> With a team of passionate and experienced educators, we offer a comprehensive curriculum designed to build confidence, encourage critical thinking, and enhance academic performance. <br/><br/>We believe in the power of education to transform lives, and we are committed to supporting our students every step of the way. </p>
      </div>
    </div>
  );
};
