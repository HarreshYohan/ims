import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Student.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { format } from 'date-fns';
import { Pagination } from '../Pagination/Pagination';

export const Student = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    firstname: '',
    lastname: '',
    grade: '',
  });
  const [grades, setGrades] = useState([]);
  const navigate = useNavigate();
  const localToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!localToken) {
      localStorage.removeItem('authToken');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/student/all`);
        if (response.status === 200) {
          const { data } = response.data;
          setData(data);
          setFilteredData(data);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
          const uniqueGrades = [...new Set(data.map((item) => item.grade))];
          setGrades(uniqueGrades);
        } else {
          setData([]);
          setFilteredData([]);
        }
      } catch (error) {
        setError('Error fetching data');
        localStorage.removeItem('authToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, itemsPerPage, localToken]);

  const applyFilters = useCallback(() => {
    const { firstname, lastname, grade } = filters;
    const filtered = data.filter((item) =>
      (firstname ? item.firstname.toLowerCase().includes(firstname.toLowerCase()) : true) &&
      (lastname ? item.lastname.toLowerCase().includes(lastname.toLowerCase()) : true) &&
      (grade ? item.grade === grade : true)
    );
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [filters, data, itemsPerPage]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (id) => {
    navigate(`/edit-student/${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete student with ID: ${id}`);
  };

  const handleDownload = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/student/download/all?${query}`, {
        headers: { Authorization: `Bearer ${localToken}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const time = format(new Date(), 'MM-dd-yyyy_HH-mm-ss');
      link.setAttribute('download', `student_report_${time}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const Table = ({ data }) => (
  <>
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>
            First Name
            <input
              type="text"
              name="firstname"
              value={filters.firstname}
              onChange={handleFilterChange}
              placeholder="Filter by first name"
              className="filter-input"
            />
          </th>
          <th>
            Last Name
            <input
              type="text"
              name="lastname"
              value={filters.lastname}
              onChange={handleFilterChange}
              placeholder="Filter by last name"
              className="filter-input"
            />
          </th>
          <th>
            Grade
            <select
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Grades</option>
              {grades.map((g, index) => (
                <option key={index} value={g}>{g}</option>
              ))}
            </select>
          </th>
          <th>Contact</th>
          <th>
            Actions
            <button className="download-all-btn" onClick={handleDownload}>Download</button>
          </th>
        </tr>
      </thead>
      <tbody>
        {data
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.firstname}</td>
              <td>{item.lastname}</td>
              <td>{item.grade}</td>
              <td>{item.contact}</td>
              <td>
                <button className="editBtn" onClick={() => handleEdit(item.id)}>Edit</button>
                <button className="deleteBtn" onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
        ))}
      </tbody>
    </table>
     <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={handlePageChange} 
      /> 
      </>
  );

  return (
    <div>
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Student" is_create={true} />
      <div className="main">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <div className="student-actions">
          <button className="create-student-btn" onClick={() => navigate('/new-student')}>
            ➕ Create New Student
          </button>
        </div>
        <Table data={filteredData} />
      </div>
    </div>
  );
};
