import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { format } from 'date-fns';
import api from '../../services/api';
import { Send, MessageCircle, Users } from 'lucide-react';

import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { FormSelect } from '../shared/FormSelect';



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
      const res = await api.get(`/student/student-subject/${userId}`);
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
      const res = await api.get(`/chatroom/${subjectId}`);
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
      const res = await api.post('/chatroom', payload, {
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
    <div className="flex flex-col h-screen bg-slate-950">
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Academic Chatroom" is_create={false} />

      <main className="flex-1 lg:ml-64 flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 overflow-hidden">
        {/* Chat Header / Subject Selector */}
        <div className="p-4 bg-slate-900/60 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                 <Users size={20} />
              </div>
              <div>
                 <h2 className="text-sm font-bold text-white uppercase tracking-wider">Subject Discussions</h2>
                 <p className="text-xs text-textMuted">Select a subject to view messages</p>
              </div>
           </div>
           
           <div className="w-64">
              <FormSelect 
                value={selectedSubject} 
                onChange={handleSubjectChange}
                options={[
                  { label: 'Select Subject...', value: '' },
                  ...subjects.map(s => ({ label: s.subject, value: s.subject_id }))
                ]}
              />
           </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {!selectedSubject ? (
             <div className="h-full flex flex-col items-center justify-center text-textMuted text-center space-y-4">
                <div className="p-6 bg-slate-900/40 rounded-full border border-white/5 shadow-2xl">
                   <MessageCircle size={48} className="opacity-20" />
                </div>
                <p className="max-w-xs text-sm font-medium">Please select a subject from the top right to start chatting with your tutors and peers.</p>
             </div>
          ) : data.length > 0 ? (
            data.map((item) => {
              const isMine = userType === item.user.username;
              return (
                <div key={item.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[70%] group`}>
                    <div className={`flex items-center gap-2 mb-1 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                       <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">{item.user.username}</span>
                       <span className="text-[10px] text-slate-600 font-medium">{format(new Date(item.createdAt), 'hh:mm a')}</span>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-lg ${
                      isMine 
                        ? 'bg-primary text-white rounded-tr-none border border-white/10' 
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                    }`}>
                      <p className="text-sm leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-textMuted py-20 italic">No messages yet. Be the first to start the conversation!</div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        {selectedSubject && (
          <div className="p-4 bg-slate-900/80 border-t border-white/5 backdrop-blur-xl">
             <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim()}
                  className="bg-primary hover:bg-primaryHover text-white p-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={20} />
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
