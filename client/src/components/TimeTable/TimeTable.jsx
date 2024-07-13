import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {useAuth}  from '../../services/authContex';
import { useNavigate } from 'react-router-dom';
import {Header } from '../Header/Header'
import './TimeTable.css';
import {Navbar} from '../Navbar/Navbar';
import {SectionHeader} from '../SectionHeader/SectionHeader';

export const TimeTable = () => {

  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const localToken = localStorage.getItem("authToken");


  useEffect(() => {
    console.log(localToken);
    if (!localToken) {
      localStorage.removeItem('authToken');
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

  return (
    <div>
      <Header type={'dashboard'} action = {"Logout"}/>
      <Navbar /> 
      <SectionHeader section={'Time Table'} is_create={true}/>
      <div className='main'>
        <p>body comes here, hii</p>
      </div>
    </div>
  );
};
