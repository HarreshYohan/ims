import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Chatroom.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import {jwtDecode} from 'jwt-decode';
import { format } from 'date-fns';

export const Chatroom = () => {
  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const localToken = localStorage.getItem("authToken");

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserType(decodedToken.username);

      const fetchSubjects = async () => {
        setLoading(true);
        setError(null);
        try {
          const userId = decodedToken.user_id;
          const subjectResponse = await api.get(`/api/student/student_subject/${userId}`);
          if (subjectResponse.status === 200) {
            setSubjects(subjectResponse.data.data.subjects);
          } else {
            setSubjects([]);
            console.error('Failed to fetch subjects');
          }
        } catch (error) {
          setError('Error during subject fetch');
          console.error('Error during subject fetch:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSubjects();
    }
  }, [localToken]);

  const fetchMessages = async (subjectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/chatroom/${subjectId}`);
      if (response.status === 200) {
        setData(response.data);
      } else {
        setData([]);
        console.error('Failed to fetch chat data');
      }
    } catch (error) {
      setError('Error during chat data fetch');
      console.error('Error during chat data fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = async (event) => {
    const selectedSubjectId = event.target.value;
    setSelectedSubject(selectedSubjectId);

    if (selectedSubjectId) {
      await fetchMessages(selectedSubjectId);
    } else {
      setData([]);
    }
  };

  const handleSendMessage = async () => {
    if (!message) return;

    const token = localStorage.getItem('authToken');
    const decodedToken = jwtDecode(token);

    const postData = {
      message,
      user_id: decodedToken.user_id,
      subjecttutorid: selectedSubject,
    };

    try {
      const response = await api.post('/api/chatroom', postData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        setMessage("");
        await fetchMessages(selectedSubject); // Fetch latest messages after sending a new one
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error during sending message:', error);
    }
  };

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Chatroom'} />

      <div className='mainchat'>
        <select className='dropdown' value={selectedSubject} onChange={handleSubjectChange}>
          <option value="" default>Select a subject</option>
          {subjects.map(subject => (
            <option key={subject.subject_id} value={subject.subject_id}>{subject.subject}</option>
          ))}
        </select>

        {data.length > 0 ? (
          data.map((item) => (
            userType === item.user.username ? (
              <div className='chatsend' key={item.id}>
                <h3 className='message'>{item.message}</h3>
                <p className='username'>{item.user.username}</p>
                <p className='time'>{format(new Date(item.createdAt), 'dd MMM yyyy HH:mm:ss')}</p>
              </div>
            ) : (
              <div className='chatreceive' key={item.id}>
                <h3 className='message'>{item.message}</h3>
                <p className='username'>{item.user.username}</p>
                <p className='time'>{format(new Date(item.createdAt), 'dd MMM yyyy HH:mm:ss')}</p>
              </div>
            )
          ))
        ) : (
          <p>No messages to display</p>
        )}
      </div>
      
      <div className='mainchat_2'>
        <input 
          type="text" 
          name="box" 
          id="Txtbox" 
          placeholder='Type your Message here' 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          disabled={!selectedSubject} 
        />
        <button className='sub' onClick={handleSendMessage} disabled={!selectedSubject}>Send</button>
      </div>
    </div>
  );
};
