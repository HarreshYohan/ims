import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './SubjectTutor.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

export const SubjectTutor = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        const response = await api.get(`/api/subject-tutor/all?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.status === 200) {
          const { data, totalPages } = response.data;
          setData(data);
          setFilteredData(data);
          setTotalPages(totalPages);

          // Extract unique grades and subjects
          const uniqueGrades = [...new Set(data.map(item => item.grade))];
          const uniqueSubjects = [...new Set(data.map(item => item.subject))];
          setGrades(uniqueGrades);
          setSubjects(uniqueSubjects);
        } else {
          setData([]);
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
  }, [currentPage, itemsPerPage, navigate, localToken]);

  useEffect(() => {
    // Filter data based on selected grade and subject
    const filtered = data.filter(item => {
      return (
        (selectedGrade ? item.grade === selectedGrade : true) &&
        (selectedSubject ? item.subject === selectedSubject : true)
      );
    });
    setFilteredData(filtered);

    // Update subjects based on selected grade
    if (selectedGrade) {
      const filteredSubjects = [...new Set(data.filter(item => item.grade === selectedGrade).map(item => item.subject))];
      setSubjects(filteredSubjects);
    } else {
      setSubjects([...new Set(data.map(item => item.subject))]);
    }
  }, [selectedGrade, selectedSubject, data]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleEdit = (id) => {
    console.log(`Edit user with ID: ${id}`);
    // Implement your edit logic here
  };

  const handleDelete = (id) => {
    console.log(`Delete user with ID: ${id}`);
    // Implement your delete logic here
  };

  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
    setSelectedSubject(''); // Reset subject filter when grade changes
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const Table = ({ data }) => (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th className="filter-header">
            Grade  
            <select value={selectedGrade} onChange={handleGradeChange}>
              <option value="">All Grades</option>
              {grades.map((grade, index) => (
                <option key={index} value={grade}>{grade}</option>
              ))}
            </select>
          </th>
          <th className="filter-header">
            Subject  
            <select value={selectedSubject} onChange={handleSubjectChange}>
              <option value="">All Subjects</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>{subject}</option>
              ))}
            </select>
          </th>
          <th>Tutor</th>
          <th>Fees</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.grade}</td>
            <td>{item.subject}</td>
            <td>{item.tutor}</td>
            <td>{item.fees}</td>
          </tr>
        ))}
        <tr>
          <td colSpan="7" className='pagination'>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button >
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <button
                key={pageNumber + 1}
                onClick={() => handlePageChange(pageNumber + 1)}
                className={currentPage === pageNumber + 1 ? 'active' : ''}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Subject Tutor'} is_create={true} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <Table data={filteredData} />
      </div>
    </div>
  );
};
