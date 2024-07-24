import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../Header/Header';
import './EditStudent.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { format } from 'date-fns';

export const EditStudent = () => {
  const [studentData, setStudentData] = useState({});
  const [feesData, setFeesData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const localToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!localToken) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [localToken, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentResponse = await api.get(`/api/student/${id}`);
        const feesResponse = await api.get(`/api/student-fees/${id}`);
        const subjectsResponse = await api.get(`/api/student-subject/${id}`);
        if (studentResponse.status === 200 && feesResponse.status === 200 && subjectsResponse.status === 200) {
          setStudentData(studentResponse.data);
          setFeesData(feesResponse.data);
          setSubjectsData(subjectsResponse.data);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        setError('Error during data fetch');
        console.error('Error during data fetch:', error);
        localStorage.removeItem('authToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, navigate, localToken]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await api.put(`/api/student/${id}`, studentData);
      if (response.status === 200) {
        alert('Student data updated successfully');
        navigate('/students');
      } else {
        console.error('Failed to update student data');
      }
    } catch (error) {
      console.error('Error updating student data:', error);
    }
  };

  const FeesCard = ({ fees }) => (
    <div className="fees-card">
      <h3>Fees</h3>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {fees.map(fee => (
            <tr key={`${fee.month}-${fee.year}`}>
              <td>{fee.month}</td>
              <td>{fee.year}</td>
              <td>{fee.totalAmount}</td>
              <td>{fee.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const SubjectsCard = ({ subjects }) => (
    <div className="subjects-card">
      <h3>Subjects</h3>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Tutor</th>
            <th>Grade</th>
            <th>Fees</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(subject => (
            <tr key={subject.subjectTutor.id}>
              <td>{subject.subjectTutor.subject.name}</td>
              <td>{`${subject.subjectTutor.tutor.title} ${subject.subjectTutor.tutor.firstname} ${subject.subjectTutor.tutor.lastname}`}</td>
              <td>{subject.subjectTutor.grade.name}</td>
              <td>{subject.subjectTutor.fees}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Edit Student'} is_create={false} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <div className="edit-student-container">
            <div className="student-form">
              <h3>Edit Student</h3>
              <label>
                First Name:<br/>
                <input
                  type="text"
                  name="firstname"
                  value={studentData.firstname || ''}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Last Name:<br/>
                <input
                  type="text"
                  name="lastname"
                  value={studentData.lastname || ''}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Grade:<br/>
                <input
                  type="text"
                  name="grade"
                  value={studentData.grade || ''}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Contact:<br/>
                <input
                  type="text"
                  name="contact"
                  value={studentData.contact || ''}
                  onChange={handleInputChange}
                />
              </label>
              <button className="saveBtn" onClick={handleSave}>Save</button>
            </div>
            <FeesCard fees={feesData} />
            <SubjectsCard subjects={subjectsData} />
          </div>
        )}
      </div>
    </div>
  );
};
