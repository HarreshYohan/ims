import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Student.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { format } from 'date-fns';
import {jwtDecode} from 'jwt-decode';
import { useRolePermissions } from '../../utils/useRolePermissions';

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
  const [role, setRole] = useState('');
  const localToken = localStorage.getItem("authToken");
  const { can_edit, can_delete } = useRolePermissions('student');

  useEffect(() => {
    if (!localToken) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`//student/all?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.status === 200) {
          const { data, totalPages } = response.data;
          setData(data);
          setFilteredData(data); 
          setTotalPages(totalPages);
          const uniqueGrades = [...new Set(data.map(item => item.grade))];
          setGrades(uniqueGrades);
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
  }, [currentPage, itemsPerPage, navigate, localToken, navigate]);

  const applyFilters = useCallback(() => {
    const { firstname, lastname, grade } = filters;
    const newFilteredData = data.filter(item =>
      (firstname ? item.firstname.toLowerCase().includes(firstname.toLowerCase()) : true) &&
      (lastname ? item.lastname.toLowerCase().includes(lastname.toLowerCase()) : true) &&
      (grade ? item.grade === grade : true)
    );
    setFilteredData(newFilteredData);
    setTotalPages(Math.ceil(newFilteredData.length / itemsPerPage));
    setCurrentPage(1); // Reset to the first page
  }, [filters, data, itemsPerPage]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleEdit = (id) => {
    console.log(`Edit user with ID: ${id}`);
    navigate(`/edit-student/${id}`)
  };

  const handleDelete = (id) => {
    console.log(`Delete user with ID: ${id}`);
    // Implement your delete logic here
  };

  const handleDownload = async () => {
    try {

      const query = new URLSearchParams(filters).toString();

      const response = await api.get(`//student/download/all?${query}`, {
        headers: {
          Authorization: `Bearer ${localToken}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const time = format(new Date(), 'MM/dd/yyyy_hh:mm:ss');
      link.setAttribute('download', 'student_report_'+time+'.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading students:', error);
    }
  };

  const Table = ({ data, currentPage, totalPages }) => (
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
          <th >
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
          <th className="filter-header">
            Grade
            <select
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Grades</option>
              {grades.map((grade, index) => (
                <option key={index} value={grade}>{grade}</option>
              ))}
            </select>
          </th>
          <th>Contact</th>
         
          {(can_delete || can_edit) && (
             <th>Actions 
            <button className="download-all-btn" onClick={handleDownload}>Download</button>
            </th>
          )}
         
        </tr>
      </thead>
      <tbody>
        {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.firstname}</td>
            <td>{item.lastname}</td>
            <td>{item.grade}</td>
            <td>{item.contact}</td>
            { (can_edit || can_delete) &&
            <td>
              {can_edit && <button className="editBtn" onClick={() => handleEdit(item.id)}>Edit</button>}
              {can_delete && <button className="deleteBtn" onClick={() => handleDelete(item.id)}>Delete</button>}
            </td>
            }
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
      <SectionHeader section={'Student'} is_create={true} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <Table data={filteredData} currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};
