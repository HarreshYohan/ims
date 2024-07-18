import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {useAuth}  from '../../services/authContex';
import { useNavigate } from 'react-router-dom';
import {Header } from '../Header/Header'
import './Chatroom.css';
import {Navbar} from '../Navbar/Navbar';
import {SectionHeader} from '../SectionHeader/SectionHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';



export const Chatroom = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate('/login');
  }
  return (
    <div>
      <Header type={'dashboard'} action = {"Logout"}/>
      <Navbar /> 
      <SectionHeader section={'Chatroom'} is_create={true}/>
      
   
      <div className='mainchat'>
     
          <select className='dropdown'>
            <option>IT</option>
            <option>English</option>
            <option>Maths</option>
            </select>
      
        <div className='chatsend'> <h3> Sent message will be here </h3></div>
        <div className='chatreceive'><h3> Received messages will be here </h3></div>
      </div>
    <div className='mainchat_2'>
        <input type="text" name="box" id="Txtbox" placeholder='Type your Message here' />
        <button className='sub'> Submit</button>
      </div>
    </div>
  );
};

