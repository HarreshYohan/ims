import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { Wallet, CheckCircle, Clock } from 'lucide-react';

export const StaffPayment = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/staff/all');
      setStaff(response.data.data);
    } catch (err) {
      console.error('Failed to fetch staff data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const totalLiability = staff.reduce((sum, s) => sum + (parseFloat(s.salary) || 0), 0);

  return (
    <Layout title="Staff Payment Management">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 bg-slate-900/40 border-l-4 border-primary">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-textMuted text-xs uppercase font-bold tracking-widest">Monthly Salary Liability</p>
            <h3 className="text-2xl font-bold text-slate-200 mt-1">LKR {totalLiability.toLocaleString()}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4 bg-slate-900/40 border-l-4 border-emerald-400">
          <div className="p-3 bg-emerald-400/10 rounded-xl text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-textMuted text-xs uppercase font-bold tracking-widest">Total Staff Count</p>
            <h3 className="text-2xl font-bold text-slate-200 mt-1">{staff.length} Members</h3>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden bg-slate-900/40 border border-white/5">
           <div className="p-4 flex items-center justify-between border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-textMuted">Period Selector</span>
              <Clock size={16} className="text-primary" />
           </div>
           <div className="p-4 grid grid-cols-2 gap-3">
              <FormSelect 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={months}
                className="!py-1.5 !text-xs"
              />
              <FormSelect 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                options={[{ label: '2025', value: 2025 }, { label: '2026', value: 2026 }]}
                className="!py-1.5 !text-xs"
              />
           </div>
        </Card>
      </div>

      <Card title="Staff Settlement Directory">
        <GenericTable 
          columns={[
            { label: 'Staff Member', accessor: 'firstname', render: (_, row) => (
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium">{row.firstname} {row.lastname}</span>
                <span className="text-[10px] text-textMuted uppercase tracking-wider">{row.position}</span>
              </div>
            )},
            { label: 'Agreed Salary', accessor: 'salary', render: (v) => <span className="text-emerald-400 font-bold">LKR {parseFloat(v).toLocaleString()}</span> },
            { label: 'Contact', accessor: 'contact' },
            { label: 'Status', accessor: 'id', render: () => (
               <span className="px-3 py-1 rounded-full bg-slate-800 text-textMuted text-[10px] font-bold uppercase tracking-widest">
                  Not Processed
               </span>
            )},
            { 
              label: 'Actions', 
              accessor: 'id',
              render: () => (
                <button className="text-xs font-bold text-primary hover:text-white transition-colors bg-primary/10 px-4 py-2 rounded-lg">
                  Log Payment
                </button>
              )
            }
          ]}
          data={staff}
          loading={loading}
          pagination={{ enabled: true, limit: 10 }}
        />
      </Card>
    </Layout>
  );
};
