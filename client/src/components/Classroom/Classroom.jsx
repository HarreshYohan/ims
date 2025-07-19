import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Classroom.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { Pagination } from '../Pagination/Pagination';

export const Classroom = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const localToken = localStorage.getItem('authToken');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', capacity: '' });

  const handleEdit = (item) => {
    setEditData(item);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/api/classroom/${editData.id}`, {
        name: editData.name,
        capacity: editData.capacity,
      });
      setShowEditModal(false);
      fetchClassroomData();
    } catch (err) {
      console.error('Error updating classroom:', err);
      alert('Failed to update classroom');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this classroom?');
    if (!confirmDelete) return;
    try {
      await api.delete(`/api/classroom/${id}`);
      fetchClassroomData();
    } catch (err) {
      console.error('Error deleting classroom:', err);
      alert('Failed to delete classroom');
    }
  };

  const fetchClassroomData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/classroom/all?page=${currentPage}&limit=${itemsPerPage}`);
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

  useEffect(() => {
    if (!localToken) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [localToken, navigate]);

  useEffect(() => {
    fetchClassroomData();
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const Table = ({ data, currentPage, totalPages }) => (<>
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Capacity</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.capacity}</td>
            <td>
              <button className="editBtn" onClick={() => handleEdit(item)}>
                Edit
              </button>
              <button className="deleteBtn" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <Pagination
                           currentPage={currentPage}
                           totalPages={totalPages}
                           onPageChange={handlePageChange} 
    /> </>
  );

  return (
    <div>
      <Header type={'dashboard'} action={'Logout'} />
      <Navbar />
      <SectionHeader section={'Classroom'} is_create={true} />
      <div className="main">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <div className="student-actions">
          <button className="create-student-btn" onClick={() => navigate('/new-classroom')}>
            ➕ Create New Classroom
          </button>
        </div>
        <Table data={data} currentPage={currentPage} totalPages={totalPages} />

        {showEditModal && (
          <div className="modal-backdrop">
            <div className="edit-modal">
              <h3>Edit Classroom</h3>
              <label>
                Name:
                <br />
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </label>
              <label>
                Capacity:
                <br />
                <input
                  type="number"
                  value={editData.capacity}
                  onChange={(e) => setEditData({ ...editData, capacity: e.target.value })}
                />
              </label>
              <div className="modal-actions">
                <button onClick={handleEditSave}>Save</button>
                <button onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
