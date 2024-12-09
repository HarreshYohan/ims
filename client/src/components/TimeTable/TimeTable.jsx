import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Timetable.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

export const Timetable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, day: null, timeslotid: null, gradeid: '', subjectid: '', tutorid: '' });
  const [classroomid, setClassroomid] = useState('');
  const [subjectTutorid, setSubjectTutorid] = useState('');
  const [timeslotid, setTimeslotid] = useState('');

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [subjectTutors, setSubjectTutors] = useState([]); // List of subject tutors

  const navigate = useNavigate();
  const localToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!localToken) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [localToken, navigate]);

  // Fetch timetable data and classrooms
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/timetable/all?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.status === 200) {
        const { data, totalPages } = response.data;
        setData(data);
        setTotalPages(totalPages);

        // Set classroomid from data
        if (data.length > 0) {
          setClassroomid(data[0]?.classroom?.id || ''); // Assuming id is available
        }

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

  // Fetch subject tutor IDs
  useEffect(() => {
    const fetchSubjectTutors = async () => {
      try {
        const response = await api.get('/api/subject-tutor/all');
        if (response.status === 200) {
          const { data } = response.data;
          setSubjectTutors(data.map(item => item.id)); // Assuming ID is the relevant field
        } else {
          console.error('Failed to fetch subject tutors');
        }
      } catch (error) {
        console.error('Error fetching subject tutors:', error);
      }
    };

    fetchSubjectTutors();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, navigate, localToken]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleEdit = (id, day, timeslotid) => {
    setEditData({ id, day, timeslotid });
    setShowModal(true);
  };

  const handleDelete = async (id, timeslotid, day) => {
    console.log(`Delete user with ID: ${id} ${day} ${timeslotid}`);
    try {
      const response = await api.delete(`/api/timetable/${id}`, {
        params: {
          day: day,
          timeslotid: timeslotid
        }
      });
      console.log(response.data);
      fetchData();
    } catch (error) {
      console.error(`Error deleting timetable: ${error.response ? error.response.data : error.message}`);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.post(`/api/timetable`, {
        subjecttutorid: subjectTutorid,
        classroomid: classroomid,
        timeslotid: editData.timeslotid,
        day: editData.day,
        gradeid: editData.gradeid,
        subjectid: editData.subjectid,
        tutorid: editData.tutorid,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${localToken}`,
        }
      });
      console.log(response.data);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(`Error saving timetable: ${error.response ? error.response.data : error.message}`);
    }
  };

  const Table = ({ data, currentPage, totalPages }) => (
    <table className="data-table-timetable">
      <thead>
        <tr>
          <th style={{ backgroundColor: 'white', color: 'black', fontSize: '24px' }} colSpan={5}>{data[0]?.classroom?.name ?? null}</th>
          <th style={{ backgroundColor: 'white', color: 'black', fontSize: '24px' }} colSpan={3}>CAPACITY : {data[0]?.classroom?.capacity ?? null}</th>
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
                      <FontAwesomeIcon icon={faPencilAlt} className="editClass" style={{ marginRight: '5px', cursor: 'pointer' }} onClick={() => handleEdit(item.classroomid, day, item.timeslotid)} />
                      <FontAwesomeIcon icon={faTrash} className="deleteClass" style={{ marginRight: '5px', cursor: 'pointer' }} onClick={() => handleDelete(item.classroomid, item.timeslotid, day)} />
                    </div>
                    <span>{item[`${day}cls`].grade.name}</span><br />
                    <span>{item[`${day}cls`].subject.name}</span><br />
                    <span>{item[`${day}cls`].tutor.title} {item[`${day}cls`].tutor.firstname}</span><br />
                  </>
                ) : (
                  <div className="createClass" style={{ position: 'absolute', top: '5px', right: '5px' }}>
                    <FontAwesomeIcon icon={faPlus} className="editClass" style={{ marginRight: '5px', cursor: 'pointer' }} onClick={() => handleEdit(item.classroomid, day, item.timeslotid)} />
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
      <SectionHeader section={'Classroom & Timetable'} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <Table data={data} currentPage={currentPage} totalPages={totalPages} />
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Timetable</h2>
            <label>
              Classroom:
              <input type="text" value={classroomid} readOnly />
            </label>
            <label>
              Timeslot:
              <input type="text" value={editData.timeslotid} readOnly />
            </label>
            <label>
              Day:
              <input type="text" value={editData.day} readOnly />
            </label>
            <label>
              Subject Tutor:
              <select value={subjectTutorid} onChange={(e) => setSubjectTutorid(e.target.value)}>
                {subjectTutors.map(tutor => (
                  <option key={tutor} value={tutor}>{tutor}</option>
                ))}
              </select>
            </label>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
