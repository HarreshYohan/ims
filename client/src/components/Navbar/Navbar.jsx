import React from 'react';
import './Navbar.css';

export const Navbar = () => {
  return (
    <nav className="vertical-navbar">
      <ul>
<<<<<<< Updated upstream
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
=======
        <li>
        <NavLink to="/dashboard">
            Dashboard
        </NavLink>
        </li>
        <NavLink to="/profile">
            Profile
        </NavLink>
        <li>
        <NavLink to="/timetable">
            Time Table
        </NavLink>
        </li>
        <li>
        <NavLink to="/student">
            Student
        </NavLink>
        </li>
        <li>
        <NavLink to="/staff">
            Staff
        </NavLink>
        </li>
        <li>
        <NavLink to="/report">
            Reports
        </NavLink>
        </li>
        <li>
        <NavLink to="/news">
            News & Updates
        </NavLink>
        </li>
        <li>
        <NavLink to="/tutor">
            Tutor
        </NavLink>
        </li>
>>>>>>> Stashed changes
      </ul>
    </nav>
  );
};

