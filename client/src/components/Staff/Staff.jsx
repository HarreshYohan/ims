import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Staff.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import debounce from 'lodash/debounce';

export const Staff = () => {
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
    position: ''
  });
  const [positions, setPositions] = useState([]);
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
        const response = await api.get(`/api/staff/all?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.status === 200) {
          const { data, totalPages } = response.data;
          setData(data);
          setFilteredData(data);
          setTotalPages(totalPages);

          const uniquePositions = [...new Set(data.map(item => item.position))];
          setPositions(uniquePositions);
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

  const applyFilters = useCallback(() => {
    const { firstname, lastname, position } = filters;
    const newFilteredData = data.filter(item =>
      (firstname ? item.firstname.toLowerCase().includes(firstname.toLowerCase()) : true) &&
      (lastname ? item.lastname.toLowerCase().includes(lastname.toLowerCase()) : true) &&
      (position ? item.position === position : true)
    );
    setFilteredData(newFilteredData);
    setTotalPages(Math.ceil(newFilteredData.length / itemsPerPage));
    setCurrentPage(1); 
  }, [filters, data, itemsPerPage]);

  const debouncedApplyFilters = useCallback(debounce(() => {
    applyFilters();
  }, 300), [applyFilters]);

  useEffect(() => {
    debouncedApplyFilters();
  }, [filters, debouncedApplyFilters]);

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
    // Implement your edit logic here, e.g., navigate to an edit page
  };

  const handleDelete = (id) => {
    console.log(`Delete user with ID: ${id}`);
    // Implement your delete logic here
  };

  const Table = ({ data, currentPage, totalPages }) => (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
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
          <th>Contact</th>
          <th>
            Position
            <select
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Positions</option>
              {positions.map((position, index) => (
                <option key={index} value={position}>{position}</option>
              ))}
            </select>
          </th>
          
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.title}</td>
            <td>{item.firstname}</td>
            <td>{item.lastname}</td>
            <td>{item.contact}</td>
            <td>{item.position}</td>
            <td>
              <button className="editBtn" onClick={() => handleEdit(item.id)}>Edit</button>
              <button className="deleteBtn" onClick={() => handleDelete(item.id)}>Delete</button>
            </td>
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
      <SectionHeader section={'Staff'} is_create={true} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <div className="student-actions">
          <button className="create-student-btn" onClick={() => navigate('/new-staff')}>
            ➕ Create New Staff
          </button>
        </div>
        <Table data={filteredData} currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};
