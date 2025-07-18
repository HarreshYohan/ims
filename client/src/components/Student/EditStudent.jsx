import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import './EditStudent.css';

export const EditStudent = () => {
  const [studentData, setStudentData] = useState({});
  const [feesData, setFeesData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, feesRes, subjectsRes, allSubjectsRes] = await Promise.all([
          api.get(`/api/student/${id}`),
          api.get(`/api/student-fees/${id}`),
          api.get(`/api/student/student-subject/${id}`),
          api.get(`/api/student-subject/subjects/${id}`)
        ]);

        setStudentData(studentRes.data);
        setFeesData(feesRes.data);
        setSubjects(subjectsRes.data.data?.subjects || []);
        setAllSubjects(allSubjectsRes.data.subjects || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/student/${id}`, studentData);
      alert('Student data updated successfully');
      navigate('/students');
    } catch (err) {
      console.error('Error saving student:', err);
    }
  };

  const handleRemoveSubject = async (subjectid) => {
    console.log(subjectid)
  const confirmDelete = window.confirm('Are you sure you want to remove this subject?');
  if (!confirmDelete) return;

  try {
    await api.delete(`/api/student-subject/remove-subject/${id}/${subjectid}`);
    const updated = await api.get(`/api/student/student-subject/${id}`);
    setSubjects(updated.data.data?.subjects || []);
  } catch (err) {
    console.error('Error removing subject:', err);
  }
};


  const handleAddSubject = async () => {
    if (!selectedSubject) return;
    try {
      await api.post('/api/student-subject/add-subject', { studentid: id, subjectid: selectedSubject });
      const updated = await api.get(`/api/student/student-subject/${id}`);
      setSubjects(updated.data.data?.subjects || []);
      setSelectedSubject('');
    } catch (err) {
      console.error('Error adding subject:', err);
    }
  };

  const FeesCard = ({ fees }) => (
    <div className="fees-card">
      <h3>Fees History</h3>
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
              <label>First Name:<br/>
                <input type="text" name="firstname" value={studentData.firstname || ''} onChange={handleInputChange} />
              </label>
              <label>Last Name:<br/>
                <input type="text" name="lastname" value={studentData.lastname || ''} onChange={handleInputChange} />
              </label>
              <label>Contact:<br/>
                <input type="text" name="contact" value={studentData.contact || ''} onChange={handleInputChange} />
              </label>
              <label>Grade:<br/>
                <input type="text" value={studentData.grade || ''} disabled />
              </label>
              <button className="saveBtn" onClick={handleSave}>Save</button>

              <div className="subjects-section">
                <h3>Enrolled Subjects</h3>
                <ul>
                    {subjects.map(sub => (
                      <li key={sub.subject_id}>
                        {sub.subject} 
                        <button 
                          className="remove-subject-btn" 
                          onClick={() => handleRemoveSubject(sub.subject_id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                    {subjects.length === 0 && <li>No subjects enrolled yet.</li>}
                  </ul>


                <div className="add-subject">
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">-- Select Subject to Add --</option>
                    {allSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.subject}</option>
                    ))}
                  </select>
                  <button onClick={handleAddSubject}>Add Subject</button>
                </div>
              </div>
            </div>
            <FeesCard fees={feesData} />
          </div>
        )}
      </div>
    </div>
  );
};
