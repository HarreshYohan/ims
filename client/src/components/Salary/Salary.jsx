import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {useAuth}  from '../../services/authContex';
import { useNavigate } from 'react-router-dom';
import {Header } from '../Header/Header'
import './Salary.css';
import {Navbar} from '../Navbar/Navbar';
import {SectionHeader} from '../SectionHeader/SectionHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';



export const Salary = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate('/login');
  }
  return (
    <div>
      
    </div>
  );
};

