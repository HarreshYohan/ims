import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Dashboard.css';  // Ensure this CSS file is created
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsByGrade, setStudentsByGrade] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [classesByGrade, setClassesByGrade] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('api/dashboard');
        const data = response.data;

        setTotalStudents(data.totalStudents);
        setStudentsByGrade(data.studentsByGrade);
        setTotalTeachers(data.totalTeachers);
        setTotalStaff(data.totalStaff);
        setClassesByGrade(data.nextClasses);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Dashboard'} is_create={false} />
      <div className='main'>
        <div className='dashboard-cards-container'>
          <div className='dashboard-card'>
            <h2>Total Students</h2>
            <p>{totalStudents}</p>
          </div>
          <div className='dashboard-card'>
            <h2>Total Teachers</h2>
            <p>{totalTeachers}</p>
          </div>
          <div className='dashboard-card'>
            <h2>Total Staff</h2>
            <p>{totalStaff}</p>
          </div>
        </div>
        <div className='table-container'>
          <div className='table-card-grade'>
            <h2>Students by Grade</h2>
            <table className="grade-table">
              <thead>
                <tr>
                  <th className="header-cell">Grade</th>
                  <th className="header-cell">Count</th>
                </tr>
              </thead>
              <tbody>
                {studentsByGrade.map((grade, index) => (
                  <tr key={index}>
                    <td className="table-cell">{grade.grade}</td>
                    <td className="table-cell">{grade.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div  className='table-card'>
          <h2>Today Classes</h2>
          {Object.entries(classesByGrade).map(([grade, classes], index) => (
            <>
            <br />
            <span />
              <h2>{grade}</h2>
              <table className="class-table">
                <thead className="table-header">
                  <tr>
                    <th className="header-cell">Timeslot</th>
                    <th className="header-cell">Classroom</th>
                    <th className="header-cell">Subject</th>
                    <th className="header-cell">Tutor</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {classes.map((classInfo, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell">{classInfo.timeslot}</td>
                      <td className="table-cell">{classInfo.classroom}</td>
                      <td className="table-cell">{classInfo.subject}</td>
                      <td className="table-cell">{classInfo.tutor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};
