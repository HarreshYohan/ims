import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export const Navbar = () => {
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen);
  };

  return (
    <nav className="vertical-navbar">
      <ul>
        <li>
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>
        </li>



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
          <NavLink to="/tutor">
            Tutor
          </NavLink>
        </li>
        <li>
          <NavLink to="/staff">
            Staff
          </NavLink>
        </li>
        <li>
          <NavLink to="/classroom">
            Classroom
          </NavLink>
        </li>
        <li onClick={toggleReports}>
            <NavLink>
            Reports
            <FontAwesomeIcon icon={isReportsOpen ? faChevronDown : faChevronRight} className="reports-arrow" />
          </NavLink>
          {isReportsOpen && (
            <ul className="nested-nav">
              <li>
                <NavLink to="/reports/user">
                  User Report
                </NavLink>
              </li>
              <li>
                <NavLink to="/reports/acc">
                  ACC Report
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        <li>
          <NavLink to="/news">
            News & Updates
          </NavLink>
        </li>
        <li>
          <NavLink to="/chatroom">
            chatroom
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
