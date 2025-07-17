import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Tutor.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import {jwtDecode} from 'jwt-decode';

export const Tutor = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const localToken = localStorage.getItem("authToken");
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (localToken) {
      try {
        const decoded = jwtDecode(localToken);
        setRole(decoded.role); // Assumes the token has a 'role' field
      } catch (error) {
        console.error('Failed to decode token', error);
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    }
  }, [localToken]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`//tutor/all?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.status === 200) {
          const { data, totalPages } = response.data; 
          setData(data);
          setTotalPages(totalPages); 
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

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleEdit = (id) => {
    console.log(`Edit user with ID: ${id}`);
    // Implement your edit logic here, e.g., navigate to an edit page
  };
  
  const handleDelete = (id) => {
    console.log(`Delete user with ID: ${id}`);
    // Implement your delete logic here
  };


  const Table = ({ data , currentPage, totalPages }) => (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Contact</th>
          {(role == 'ADMIN' && role == 'STAFF') && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.title}</td>
            <td>{item.firstname}</td>
            <td>{item.lastname}</td>
            <td>{item.contact}</td>
            {(role == 'ADMIN' && role == 'STAFF') && (
            <td>
              <button className="editBtn" onClick={() => handleEdit(item.id)}>Edit</button>
              <button className="deleteBtn" onClick={() => handleDelete(item.id)}>Delete</button>
            </td>
          )}
          </tr>
        ))}
      </tbody>
      <tfoot>
      <td colSpan="4" class="tfoot-left"></td>
      <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
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
        </div>
      </tfoot>
      
    </table>
    
  );

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Tutor'} is_create={true} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <Table data={data} currentPage={currentPage} totalPages={totalPages}  />

      </div>
    </div>
  );
};
