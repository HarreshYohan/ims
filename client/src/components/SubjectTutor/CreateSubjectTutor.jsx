import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import './SubjectTutor.css';

export const CreateSubjectTutor = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [formData, setFormData] = useState({
    grade: '',
    subject: '',
    tutor: '',
    fees: ''
  });
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [gradeRes, subjectRes, tutorRes] = await Promise.all([
          api.get('/api/grade'),
          api.get('/api/subject/all'),
          api.get('/api/tutor/all')
        ]);
        setGrades(gradeRes.data);
        setSubjects(subjectRes.data.data);
        setTutors(tutorRes.data.data);
      } catch (err) {
        console.error('Dropdown data fetch failed:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { grade, subject, tutor, fees } = formData;

    if (!grade || !subject || !tutor || !fees) {
      setError('All fields are required');
      return;
    }

    try {
      await api.post('/api/subject-tutor', {
        gradeid: grade,
        subjectid: subject,
        tutorid: tutor,
        fees: parseFloat(fees)
      });

      alert('✅ Subject-Tutor mapping created successfully!');
      navigate('/subject-tutor');
    } catch (err) {
      console.error('Create error:', err);
      setError('Failed to create subject-tutor mapping.');
    }
  };

  return (
    <div>
      <Header type={'dashboard'} action={'Logout'} />
      <Navbar />
      <SectionHeader section={'Create Subject Tutor'} is_create={false} />

      <div className="main">
        <div className="form-card">
          <h2>Create Subject-Tutor Mapping</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Grade:</label>
              <select name="grade" value={formData.grade} onChange={handleChange}>
                <option value="">-- Select Grade --</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject:</label>
              <select name="subject" value={formData.subject} onChange={handleChange}>
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tutor:</label>
              <select name="tutor" value={formData.tutor} onChange={handleChange}>
                <option value="">-- Select Tutor --</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>{t.firstname +" " + t.lastname}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fees:</label>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                step="0.01"
                placeholder="Enter fees"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="createBtn">Create</button>
              <button type="button" className="cancelBtn" onClick={() => navigate('/subject-tutor')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
