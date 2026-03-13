import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { FormSelect } from '../shared/FormSelect';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, TrendingUp, PieChart as PieIcon } from 'lucide-react';

export const UserReport = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [monthlySummary, setMonthlySummary] = useState([]);
  const [roleSummary, setRoleSummary] = useState([]);

  const chartRef = useRef(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/all');
      const usersData = response.data.data;
      setUsers(usersData);
      setFilteredUsers(usersData);
      generateSummaries(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generateSummaries = (userData) => {
    // Monthly Summary
    const monthlyMap = {};
    const roleMap = {};
    
    userData.forEach(user => {
      const month = format(new Date(user.createdAt), 'yyyy-MM');
      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
      roleMap[user.user_type] = (roleMap[user.user_type] || 0) + 1;
    });

    setMonthlySummary(Object.entries(monthlyMap).map(([month, count]) => ({ month, count })));
    setRoleSummary(Object.entries(roleMap).map(([role, count]) => ({ role, count })));
  };

  useEffect(() => {
    if (selectedRole) {
      const filtered = users.filter(user => user.user_type === selectedRole);
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [selectedRole, users]);

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Username', 'Email', 'Role', 'Created At'];
    const rows = filteredUsers.map(u => [
      u.id, 
      u.username, 
      u.email, 
      u.user_type, 
      format(new Date(u.createdAt), 'yyyy-MM-dd')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_report_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  const handleDownloadPdf = async () => {
    const element = chartRef.current;
    const canvas = await html2canvas(element, { backgroundColor: '#0f172a' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(22);
    pdf.text("User Analytics Report", 20, 20);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 30);
    pdf.addImage(imgData, 'PNG', 10, 40, pdfWidth - 20, pdfHeight);
    pdf.save(`user_analytics_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Username', accessor: 'username', render: (val) => <span className="text-white font-medium">{val}</span> },
    { label: 'Email', accessor: 'email' },
    { 
      label: 'Role', 
      accessor: 'user_type',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'STUDENT' ? 'bg-primary/20 text-primary' : 
          val === 'TUTOR' ? 'bg-secondary/20 text-secondary' : 'bg-amber-400/20 text-amber-400'
        }`}>
          {val}
        </span>
      )
    },
    { label: 'Joined', accessor: 'createdAt', render: (val) => format(new Date(val), 'MMM dd, yyyy') },
  ];

  return (
    <Layout title="User Reports">
        
        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2" title="Registration Trends">
              <div className="h-[300px] w-full mt-4" ref={chartRef}>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleSummary}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                       <XAxis dataKey="role" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                         itemStyle={{ color: '#fff' }}
                       />
                       <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           <div className="space-y-6">
              <Card title="Quick Distribution" className="flex flex-col h-full">
                 <div className="space-y-4 mt-2">
                    {roleSummary.map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-secondary' : 'bg-amber-400'}`} />
                             <span className="text-sm font-medium">{item.role}</span>
                          </div>
                          <span className="font-bold text-lg">{item.count}</span>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>

        {/* Filter & Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
           <div className="md:col-span-3 flex items-center gap-2 text-textMuted px-2">
              <FileText size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">Report Configuration</span>
           </div>
           <div className="md:col-span-3">
              <FormSelect 
                name="roleFilter" 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                options={[
                  { label: 'All Roles', value: '' },
                  { label: 'Student', value: 'STUDENT' },
                  { label: 'Tutor', value: 'TUTOR' },
                  { label: 'Staff', value: 'STAFF' },
                ]}
              />
           </div>
           <div className="md:col-span-6 flex justify-end gap-3">
              <button 
                onClick={handleDownloadCsv} 
                className="px-4 py-2 border border-slate-700 rounded-xl text-textMuted hover:text-white transition-all flex items-center gap-2"
              >
                <Download size={18} />
                <span>CSV</span>
              </button>
              <button 
                onClick={handleDownloadPdf} 
                className="btn-primary flex items-center gap-2 !px-6"
              >
                <FileText size={18} />
                <span>Download Report (PDF)</span>
              </button>
           </div>
        </div>

        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl">{error}</div>}

        <Card title="User Registry Data">
          <GenericTable 
            columns={columns} 
            data={filteredUsers} 
            loading={loading}
            pagination={{ enabled: true, limit: 10 }}
          />
        </Card>
    </Layout>
  );
};
