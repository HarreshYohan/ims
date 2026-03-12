import React, { useEffect, useState } from 'react';

import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { Message } from '../Message/Message.jsx';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { Card } from '../shared/Card';
import { Info } from 'lucide-react';

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem('authToken');

  const handleClose = () => setMessage(null);

  useEffect(() => {
    if (token) {
      const { user_id } = jwtDecode(token);
      fetchProfile(user_id);
    }
  }, [token]);

  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`/profile/${userId}`);
      const data = response.data;
      setRole(data.user_type || 'STUDENT');
      setUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error?.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!user.username || user.username.trim().length < 1) return 'Username must contain at least one character.';
    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return 'Invalid email format.';
    if (!user.firstname || !/[a-zA-Z]{3,}/.test(user.firstname)) return 'First name must have at least 3 letters.';
    if (!user.lastname || !/[a-zA-Z]{3,}/.test(user.lastname)) return 'Last name must have at least 3 letters.';
    if (!user.contact || !/^\d{10}$/.test(user.contact)) return 'Contact number must be exactly 10 digits.';
    return null;
  };

  const handleUpdate = async () => {
    const validationError = validateFields();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    try {
      const updateId = user.user_id || user.id;
      await api.post(`/profile/${updateId}`, user);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      const errorText = err?.response?.data?.error || 'An unexpected error occurred';
      setMessage({ type: 'error', text: errorText });
    }
  };

  if (!user) return <div>Loading...</div>;

  // Field editability per role
  const isAdmin = role === 'ADMIN';
  const isStudent = role === 'STUDENT';
  const isTutorOrStaff = role === 'TUTOR' || role === 'STAFF';

  const canEditName = isAdmin;
  const canEditUsername = isAdmin;
  const canEditEmail = isAdmin;
  const canEditContact = true; // everyone
  const canEditTitle = isAdmin || isTutorOrStaff;

  const ReadOnlyField = ({ label, value }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-textMuted uppercase ml-1">{label}</label>
      <div className="input-field !py-2.5 bg-slate-900/60 text-slate-400 cursor-not-allowed">{value || '—'}</div>
    </div>
  );

  const EditableField = ({ label, name, value, type = 'text', editable = true }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-textMuted uppercase ml-1">{label}</label>
      <input
        type={type}
        name={name}
        className={`input-field !py-2.5 ${!editable ? 'bg-slate-900/60 text-slate-400 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={editable ? handleChange : undefined}
        readOnly={!editable}
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Profile" is_create={false} />

      <main className="flex-1 lg:ml-64 p-6 lg:p-10 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-500">

        {/* Student restriction info banner */}
        {isStudent && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Info size={20} className="text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              To change your name, email, or grade, please contact your staff coordinator.
              You can update your <strong>contact number</strong> below.
            </p>
          </div>
        )}

        <Card title="User Profile Management" className="border-t-4 border-t-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Read-only Info */}
            <div className="space-y-4 p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50">
               <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Account Information</h3>
               <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-textMuted text-xs uppercase">Internal ID</span>
                    <span className="text-white font-mono text-sm">{user.user_id || user.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-textMuted text-xs uppercase">Role</span>
                    <span className="bg-primary/20 text-primary px-3 py-0.5 rounded-full text-xs font-bold">{role}</span>
                  </div>
               </div>
            </div>

            {/* Editable Form Side */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <EditableField label="First Name" name="firstname" value={user.firstname} editable={canEditName} />
                <EditableField label="Last Name" name="lastname" value={user.lastname} editable={canEditName} />
              </div>

              <EditableField label="Username" name="username" value={user.username} editable={canEditUsername} />
              <EditableField label="Email Address" name="email" value={user.email} type="email" editable={canEditEmail} />
              <EditableField label="Contact Number" name="contact" value={user.contact} editable={canEditContact} />

              {/* Student: show grade as read-only */}
              {isStudent && (
                <ReadOnlyField label="Grade" value={user.grade} />
              )}

              {/* Tutor/Staff: show title selector (editable), no grade at all */}
              {(isTutorOrStaff || isAdmin) && (role === 'TUTOR' || role === 'STAFF') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-textMuted uppercase ml-1">Title</label>
                  <select name="title" className="input-field !py-2.5" value={user.title || ''} onChange={canEditTitle ? handleChange : undefined} disabled={!canEditTitle}>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>
              )}

              {/* Staff: show position as read-only */}
              {role === 'STAFF' && (
                <ReadOnlyField label="Position" value={user.position} />
              )}

              <div className="pt-4 border-t border-slate-800">
                <button onClick={handleUpdate} className="btn-primary w-full shadow-lg shadow-primary/20">
                  Save Profile Changes
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-xl border flex items-center justify-center animate-in slide-in-from-top-2 duration-300 ${
                  message.type === 'success' ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-danger/10 border-danger/30 text-danger'
                }`}>
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

