import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { format } from 'date-fns';
import api from '../../services/api';

import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

import './Chatroom.css';

export const Chatroom = () => {
  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUserType(decoded.username);
      fetchSubjects(decoded.user_id);
    }
  }, [token]);

  const fetchSubjects = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/student/student-subject/${userId}`);
      if (res.status === 200) {
        setSubjects(res.data.data.subjects);
      } else {
        console.error('Failed to fetch subjects');
        setSubjects([]);
      }
    } catch (err) {
      console.error('Error during subject fetch:', err);
      setError('Error during subject fetch');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (subjectId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/chatroom/${subjectId}`);
      if (res.status === 200) {
        setData(res.data);
        setTimeout(scrollToBottom, 100);
      } else {
        console.error('Failed to fetch chat data');
        setData([]);
      }
    } catch (err) {
      console.error('Error during chat data fetch:', err);
      setError('Error during chat data fetch');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);

    if (subjectId) {
      await fetchMessages(subjectId);
    } else {
      setData([]);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const decoded = jwtDecode(token);
    const payload = {
      message,
      user_id: decoded.user_id,
      subjecttutorid: selectedSubject,
    };

    try {
      const res = await api.post('/api/chatroom', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201) {
        setMessage('');
        await fetchMessages(selectedSubject);
        setTimeout(scrollToBottom, 100);
      } else {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error during sending message:', err);
    }
  };

  return (
    <div>
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Chatroom" />

      <div className="mainchat">
        <div className="dropdown">
          <select value={selectedSubject} onChange={handleSubjectChange}>
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.subject_id} value={subject.subject_id}>
                {subject.subject}
              </option>
            ))}
          </select>
        </div>

        {data.length > 0 ? (
          data.map((item) =>
            userType === item.user.username ? (
              <div className="chatsend" key={item.id}>
                <h3 className="message">{item.message}</h3>
                <div className="meta">
                  <span>{item.user.username}</span>
                  <span>{format(new Date(item.createdAt), 'dd MMM yyyy HH:mm')}</span>
                </div>
              </div>
            ) : (
              <div className="chatreceive" key={item.id}>
                <h3 className="message">{item.message}</h3>
                <div className="meta">
                  <span>{item.user.username}</span>
                  <span>{format(new Date(item.createdAt), 'dd MMM yyyy HH:mm')}</span>
                </div>
              </div>
            )
          )
        ) : (
          <p>No messages to display</p>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="mainchat_2">
        <input
          type="text"
          id="Txtbox"
          placeholder="Type your Message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!selectedSubject}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button className="sub" onClick={handleSendMessage} disabled={!selectedSubject}>
          Send
        </button>
      </div>
    </div>
  );
};
