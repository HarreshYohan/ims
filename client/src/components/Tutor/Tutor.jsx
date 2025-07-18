import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Tutor.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { jwtDecode } from 'jwt-decode';

export const Tutor = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const localToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (localToken) {
      try {
        const decoded = jwtDecode(localToken);
        setRole(decoded.role);
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
        const response = await api.get(`/api/tutor/all?page=${currentPage}&limit=${itemsPerPage}`);
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
  navigate(`/edit-tutor/${id}`);
  };

const handleDelete = async (id) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this tutor?');
  if (!confirmDelete) return;

  try {
    const response = await api.delete(`/api/tutor/${id}`);
    if (response.status === 200) {
      alert('Tutor deleted successfully');
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } else {
      alert('Failed to delete tutor');
    }
  } catch (err) {
    console.error('Error deleting tutor:', err);
    alert('Error occurred while deleting tutor');
  }
};
  const handleCreate = () => {
    navigate('/new-tutor');
  };


  const Table = ({ data, currentPage, totalPages }) => (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Contact</th>
          <th>Actions</th>
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
            <td>
            <button className="editBtn" onClick={() => handleEdit(item.id)}>Edit</button>
            <button className="deleteBtn" onClick={() => handleDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="6" className="pagination">
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
          </td>
        </tr>
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
        <div className="tutor-actions">
            <button className="create-tutor-btn" onClick={handleCreate}>
              ➕ Create New Tutor
            </button>
        </div>
        <Table data={data} currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};
