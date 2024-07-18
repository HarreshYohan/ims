import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Timetable.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

export const Timetable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); 
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/timetable/all?page=${currentPage}&limit=${itemsPerPage}`);
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
  
  const handleDelete = async (id, day) => {
    console.log(`Delete user with ID: ${id} ${day}`);
    try {
      const response = await api.delete(`/api/timetable/${id}`, {
        data: { day }  
      });
      console.log(response.data);
      fetchData();
    } catch (error) {
      console.error(`Error deleting timetable: ${error.response ? error.response.data : error.message}`);
    }
  };

  const Table = ({ data , currentPage, totalPages }) => (
    <table className="data-table-timetable">
      <thead>
        <tr >
          <th style={{'backgroundColor':'white', 'color':'black', 'fontSize':'24px'}} colSpan={5}>{data[0]?.classroom?.name ?? null}</th>
          <th style={{'backgroundColor':'white', 'color':'black', 'fontSize':'24px'}} colSpan={3}>CAPACITY : {data[0]?.classroom?.capacity ?? null}</th>
        </tr>
        <tr>
          <th>Timeslot</th>
          <th>MONDAY</th>
          <th>TUESDAY</th>          
          <th>WEDNESDAY</th>
          <th>THURSDAY</th>
          <th>FRIDAY</th>          
          <th>SATURDAY</th>
          <th>SUNDAY</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td className='slot'>{item.timeslot}</td>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <td key={day} style={{ position: 'relative' }}>
                {item[`${day}cls`] ? (
                  <>
                    <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
                      
                      <FontAwesomeIcon icon={faTrash} className="deleteClass" style={{ marginRight: '5px', cursor: 'pointer' }} onClick={() => handleDelete(item.timeslotid, day)} />
                    </div>
                    <span>{item[`${day}cls`].grade.name}</span><br/>
                    <span>{item[`${day}cls`].subject.name}</span><br/>
                    <span>{item[`${day}cls`].tutor.title} {item[`${day}cls`].tutor.firstname}</span><br/>
                  </>
                ) : (
                  <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
                    <FontAwesomeIcon icon={faPlus} className="editClass" style={{ marginRight: '5px', cursor: 'pointer' }} onClick={() => handleEdit()} />
                  </div>
                )}
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td colSpan="9" className='pagination'>
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
      <SectionHeader section={'Classroom & Timetable'} is_create={true} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <Table data={data} currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};
