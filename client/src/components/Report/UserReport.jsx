import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './UserReport.css';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Pagination } from '../Pagination/Pagination';

export const UserReport = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [monthlySummary, setMonthlySummary] = useState([]);
  const [roleSummary, setRoleSummary] = useState([]);

  const chartRef = useRef(null);
  const navigate = useNavigate();
  const localToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!localToken) navigate('/login');
  }, [localToken, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/user/all');
        if (response.status === 200) {
          const usersData = response.data.data;
          setUsers(usersData);
          setFilteredUsers(usersData);
          setRoles([...new Set(usersData.map(user => user.user_type))]);
          generateMonthlySummary(usersData);
          generateRoleSummary(usersData);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (selectedRole) {
      const filtered = users.filter(user => user.user_type === selectedRole);
      setFilteredUsers(filtered);
      generateMonthlySummary(filtered);
    } else {
      setFilteredUsers(users);
      generateMonthlySummary(users);
    }
  }, [selectedRole, users]);

  const generateMonthlySummary = (userData) => {
    const summary = {};
    userData.forEach(user => {
      const month = format(new Date(user.createdAt), 'yyyy-MM');
      summary[month] = (summary[month] || 0) + 1;
    });
    const result = Object.entries(summary).map(([month, count]) => ({ month, count }));
    setMonthlySummary(result);
  };

  const generateRoleSummary = (userData) => {
    const summary = {};
    userData.forEach(user => {
      summary[user.user_type] = (summary[user.user_type] || 0) + 1;
    });
    const result = Object.entries(summary).map(([role, count]) => ({ role, count }));
    setRoleSummary(result);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleDownloadCsv = () => {
    const csvHeaders = ['ID', 'Name', 'Email', 'Role', 'Created At'];
    const userRows = filteredUsers.map(user => [
      user.id,
      user.username,
      user.email,
      user.user_type,
      format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm')
    ]);

    const monthlySummaryHeaders = ['Month-Year', 'User Count'];
    const monthlyRows = monthlySummary.map(item => [item.month, item.count]);

    const roleSummaryHeaders = ['Role', 'User Count'];
    const roleRows = roleSummary.map(item => [item.role, item.count]);

    const csvContent = [
      ['User Report'],
      csvHeaders,
      ...userRows,
      [],
      ['Monthly Created Users Summary'],
      monthlySummaryHeaders,
      ...monthlyRows,
      [],
      ['Users by Role Summary'],
      roleSummaryHeaders,
      ...roleRows
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_report_${timestamp}.csv`;
    link.click();
  };

  const handleDownloadPdf = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

    doc.setFontSize(16);
    doc.text('User Report', 10, 10);

    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, 15, 190, 60);
    }

    let yOffset = 80;

    doc.setFontSize(12);
    doc.text('Monthly Created Users Summary:', 10, yOffset);
    yOffset += 5;
    monthlySummary.forEach(item => {
      doc.text(`${item.month}: ${item.count}`, 10, yOffset);
      yOffset += 5;
    });

    yOffset += 5;
    doc.text('Users by Role Summary:', 10, yOffset);
    yOffset += 5;
    roleSummary.forEach(item => {
      doc.text(`${item.role}: ${item.count}`, 10, yOffset);
      yOffset += 5;
    });

    doc.save(`user_report_${timestamp}.pdf`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'User Report'} is_download={false} />
      <div className='main'>
        <div className="report-container">
          <div className="report-filters">
            <label>Filter by Role: </label>
            <select value={selectedRole} onChange={handleRoleChange}>
              <option value="">All Roles</option>
              {roles.map((role, index) => (
                <option key={index} value={role}>{role}</option>
              ))}
            </select>
            <button className="download-btn" onClick={handleDownloadCsv}>⬇️ Download CSV</button>
            <button className="download-btn" onClick={handleDownloadPdf}>⬇️ Download PDF</button>
          </div>

          {loading ? <p>Loading...</p> : (
            <>
              <div className="summary-section">
                <h3>📅 Monthly Created Users Summary</h3>
                <table className="summary-table">
                  <thead>
                    <tr><th>Month-Year</th><th>User Count</th></tr>
                  </thead>
                  <tbody>
                    {monthlySummary.map((item, index) => (
                      <tr key={index}><td>{item.month}</td><td>{item.count}</td></tr>
                    ))}
                  </tbody>
                </table>

                <h3>👥 Users by Role Summary</h3>
                <table className="summary-table">
                  <thead>
                    <tr><th>Role</th><th>User Count</th></tr>
                  </thead>
                  <tbody>
                    {roleSummary.map((item, index) => (
                      <tr key={index}><td>{item.role}</td><td>{item.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="chart-container" ref={chartRef}>
                <h3>📊 Users by Role Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roleSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Users Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.user_type}</td>
                      <td>{format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
