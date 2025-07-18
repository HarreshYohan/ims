import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCalendarAlt, faUser, faChalkboardTeacher, faUsers, faComments, faBuilding, faExchangeAlt, faBook, faFileAlt, faNewspaper, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';

export const Navbar = () => {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserType(decodedToken.user_type);
    }
  }, []);

  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen);
  };

  return (
    <nav className="vertical-navbar">
      <ul>
        <li>
          <NavLink to="/dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/timetable">
            <FontAwesomeIcon icon={faCalendarAlt} className="nav-icon" />
            Time Table
          </NavLink>
        </li>
        <li>
          <NavLink to="/student">
            <FontAwesomeIcon icon={faUser} className="nav-icon" />
            Student
          </NavLink>
        </li>
        <li onClick={toggleReports}>
              <NavLink>
                <FontAwesomeIcon icon={faChalkboardTeacher} className="nav-icon" />
                Tutor
                <FontAwesomeIcon icon={isReportsOpen ? faChevronDown : faChevronRight} className="reports-arrow" />
              </NavLink>
              {isReportsOpen && (
                <ul className="nested-nav">
                  <li>
                    <NavLink to="/tutor">
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="nav-icon" />
                      Tutors
                    </NavLink>
                  </li>
                   <li>
                    <NavLink to="/tutor-payment">
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="nav-icon" />
                      Tutor Payments
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
        <li>
          <NavLink to="/staff">
            <FontAwesomeIcon icon={faUsers} className="nav-icon" />
            Staff
          </NavLink>
        </li>
        <li>
          <NavLink to="/chatroom">
            <FontAwesomeIcon icon={faComments} className="nav-icon" />
            Chatroom
          </NavLink>
        </li>
        <li>
          <NavLink to="/classroom">
            <FontAwesomeIcon icon={faBuilding} className="nav-icon" />
            Classroom
          </NavLink>
        </li>
        <li>
          <NavLink to="/transaction">
            <FontAwesomeIcon icon={faExchangeAlt} className="nav-icon" />
            Transaction
          </NavLink>
        </li>
        <li>
          <NavLink to="/subject-tutor">
            <FontAwesomeIcon icon={faBook} className="nav-icon" />
            Subjects
          </NavLink>
        </li>
          <>
            <li onClick={toggleReports}>
              <NavLink>
                <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                Reports
                <FontAwesomeIcon icon={isReportsOpen ? faChevronDown : faChevronRight} className="reports-arrow" />
              </NavLink>
              {isReportsOpen && (
                <ul className="nested-nav">
                  <li>
                    <NavLink to="/reports/user">
                      <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                      User Report
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/reports/acc">
                      <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                      ACC Report
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          </>
        {/* )} */}
      </ul>
    </nav>
  );
};
