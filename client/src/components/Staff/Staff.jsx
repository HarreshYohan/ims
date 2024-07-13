import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {useAuth}  from '../../services/authContex';
import { useNavigate } from 'react-router-dom';
import {Header } from '../Header/Header'
import './Staff.css';
import '../../App.css'
import {Navbar} from '../Navbar/Navbar';
import {SectionHeader} from '../SectionHeader/SectionHeader';

export const Staff = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const localToken = localStorage.getItem("authToken");

  useEffect(() => {
    
    if (!localToken) {
      localStorage.removeItem('authToken');//
      navigate('/login');
    }
    
    const fetchData = async () => {
      try {
        const response = await api.get('/api/user/all');
        if (response.status === 200) {
          
          const result = await response.data;
          setData(result.data);
        } else {
          setData([]);
          console.error('Failed to fetch data');
        }
      } catch (error) {
        setData([]);
        localStorage.removeItem('authToken');
        navigate('/login');
        console.error('Error during data fetch:', error);
      }


    };

    fetchData();
  }, []);

  const Table = ({ data }) => {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.username}</td>
              <td>{item.email}</td>
              <td>{item.user_type}</td>
              <td>
                <button onClick={() => handleEdit(item.id)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleEdit = (id) => {
    console.log(`Edit user with ID: ${id}`);
    // Implement your edit logic here, e.g., navigate to an edit page
  };
  
  const handleDelete = (id) => {
    console.log(`Delete user with ID: ${id}`);
    // Implement your delete logic here
  };

  return (
    <div>
      <Header type={'dashboard'} action = {"Logout"}/>
      <Navbar /> 
      <SectionHeader section={'Staff'} is_create={true} />
      <div className='main'>
        <Table data={data} />
      </div>
    </div>
  );
};

