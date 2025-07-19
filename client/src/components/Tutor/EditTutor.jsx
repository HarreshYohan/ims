import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import './EditTutor.css';

export const EditTutor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutorData, setTutorData] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjectsByGrade, setSubjectsByGrade] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectFees, setSubjectFees] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorRes, subjectMapRes, gradesRes] = await Promise.all([
          api.get(`/api/tutor/${id}`),
          api.get(`/api/tutor/subject-mapping/${id}`),
          api.get(`/api/tutor/grades/all`),
        ]);

        setTutorData(tutorRes.data);
        setSubjects(subjectMapRes.data.subjects);
        setGrades(gradesRes.data);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTutorData({ ...tutorData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/tutor/${id}`, tutorData);
      alert('Tutor updated successfully');
      navigate('/tutor');
    } catch (err) {
      console.error('Error saving tutor:', err);
    }
  };

  const handleGradeChange = async (gradeid) => {
    setSelectedGrade(gradeid);
    setSelectedSubject('');
    if (!gradeid) {
      setSubjectsByGrade([]);
      return;
    }
    try {
      const res = await api.get(`/api/tutor/subjects/${gradeid}`);
      setSubjectsByGrade(res.data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

    const handleAddSubject = async () => {
    if (!selectedGrade || !selectedSubject || !subjectFees) {
        alert('Please select grade, subject and enter fees');
        return;
    }
    try {
        await api.post(`/api/tutor/add-subject`, {
        tutorid: id,
        subjectid: selectedSubject,
        gradeid: selectedGrade,
        fees: subjectFees
        });
        const updated = await api.get(`/api/tutor/subject-mapping/${id}`);
        setSubjects(updated.data.subjects);
        setSelectedGrade('');
        setSelectedSubject('');
        setSubjectFees('');
        setSubjectsByGrade([]);
    } catch (err) {
        console.error('Error adding subject:', err);
    }
    };


  const handleRemoveSubject = async (subjectTutorId) => {
    if (!window.confirm('Are you sure you want to remove this subject?')) return;
    try {
      await api.delete(`/api/tutor/remove-subject/${id}/${subjectTutorId}`);
      const updated = await api.get(`/api/tutor/subject-mapping/${id}`);
      setSubjects(updated.data.subjects);
    } catch (err) {
      console.error('Error removing subject:', err);
    }
  };

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Edit Tutor'} is_create={false} />
      <div className="main">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <div className="edit-tutor-container">
            <div className="tutor-form">
              <h3>Edit Tutor Details</h3>
              <label>Title:<br />
                <input type="text" name="title" value={tutorData.title || ''} onChange={handleInputChange} />
              </label>
              <label>First Name:<br />
                <input type="text" name="firstname" value={tutorData.firstname || ''} onChange={handleInputChange} />
              </label>
              <label>Last Name:<br />
                <input type="text" name="lastname" value={tutorData.lastname || ''} onChange={handleInputChange} />
              </label>
              <label>Contact:<br />
                <input type="text" name="contact" value={tutorData.contact || ''} onChange={handleInputChange} />
              </label>
              <button className="saveBtn" onClick={handleSave}>Save</button>

              <div className="subjects-section">
                <h3>Teaching Subjects</h3>
                <ul>
                  {subjects.map(sub => (
                    <li key={sub.id}>
                      {sub.subject} - {sub.grade}
                      <button className="remove-subject-btn" onClick={() => handleRemoveSubject(sub.id)}>Remove</button>
                    </li>
                  ))}
                  {subjects.length === 0 && <li>No subjects mapped yet.</li>}
                </ul>

                <div className="add-subject">
                  <select value={selectedGrade} onChange={(e) => handleGradeChange(e.target.value)}>
                    <option value="">-- Select Grade --</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                  </select>

                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!subjectsByGrade.length}>
                    <option value="">-- Select Subject --</option>
                    {subjectsByGrade.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Fees (LKR)"
                    value={subjectFees}
                    onChange={(e) => setSubjectFees(e.target.value)}
                    disabled={!selectedSubject}
                />

                  <button onClick={handleAddSubject}>Add Subject</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
