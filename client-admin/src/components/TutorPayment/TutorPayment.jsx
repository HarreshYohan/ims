import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { jwtDecode } from 'jwt-decode';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { Wallet, ArrowUpCircle, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export const TutorPayment = () => {
  const [groupedData, setGroupedData] = useState({});
  const [paymentsData, setPaymentsData] = useState([]); // store payment records for tutors by month/year
  const [loading, setLoading] = useState(true);

  const [editingTutorId, setEditingTutorId] = useState(null);
  const [paymentType, setPaymentType] = useState('PAID');
  const [amount, setAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-based month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch summary breakdown (subjects + students + fees)
      const summaryResponse = await api.get(`/tutor-payments/summary?_t=${new Date().getTime()}`);
      if (summaryResponse.status === 200) {
        const rawData = summaryResponse.data.data;
        const grouped = {};
        rawData.forEach((item) => {
          const key = item.tutorid;
          if (!grouped[key]) {
            grouped[key] = {
              tutorid: item.tutorid,
              firstname: item.firstname,
              lastname: item.lastname,
              totalPayment: 0,
              breakdown: [],
            };
          }
          grouped[key].totalPayment += (parseFloat(item.totalPayment) || 0);
          grouped[key].breakdown.push({
            subject: item.subject,
            grade: item.grade,
            studentCount: item.studentCount,
            payment: item.totalPayment,
          });
        });
        setGroupedData(grouped);
      }

      // Fetch all tutor payment records (received amounts) — you need an endpoint for this
      const paymentsResponse = await api.get(`/tutor-payments?_t=${new Date().getTime()}`); // Make sure this route exists and returns TutorPayment data with tutorid, month, year, received, totalpayment
      if (paymentsResponse.status === 200) {
        setPaymentsData(paymentsResponse.data); // Array of payment records
      }
    } catch (err) {
      console.error('Data fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to get received amount for a tutor from paymentsData
  const getTotalReceived = (tutorid) => {
    return paymentsData
      .filter((p) => p.tutorid === tutorid)
      .reduce((sum, p) => sum + Number(p.received), 0);
  };

  const startEditing = (tutorid) => {
    setEditingTutorId(tutorid);
    setAmount('');
  };

  const cancelEditing = () => {
    setEditingTutorId(null);
    setAmount('');
  };

  const handleUpdateStatus = async () => {
    if (paymentType === 'PAID' && (!amount || isNaN(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Get totalPayment for the tutor currently editing
    const tutorKey = Object.keys(groupedData).find(
      (key) => groupedData[key].tutorid === editingTutorId
    );
    const totalPayment = tutorKey ? groupedData[tutorKey].totalPayment : 0;

    try {
      await api.post('/tutor-payments/update-status', {
        tutorid: editingTutorId,
        paymentType,
        amount: paymentType === 'PENDING' ? 0 : Number(amount),
        totalPayment,
        month: selectedMonth,
        year: selectedYear,
      });
      toast.success('Payment status updated');
      cancelEditing();
      fetchData();
    } catch (err) {
      console.error('Failed to update payment status', err);
      toast.error('Error updating payment');
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Tutor', 'Month', 'Year', 'Total Liability', 'Received', 'Outstanding'];
    const rows = Object.values(groupedData).map(t => [
      `${t.firstname} ${t.lastname}`,
      months.find(m => m.value === selectedMonth)?.name,
      selectedYear,
      t.totalPayment,
      getTotalReceived(t.tutorid),
      t.totalPayment - getTotalReceived(t.tutorid)
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tutor_settlements_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  const handleDownloadPdf = async () => {
    const element = document.querySelector('.space-y-8');
    const canvas = await html2canvas(element, { backgroundColor: '#0f172a' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`tutor_settlement_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  return (
    <Layout title="Tutor Payment Summary">
        {loading ? (
             <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
             </div>
        ) : Object.keys(groupedData).length === 0 ? (
          <Card className="text-center py-12 text-textMuted">No records found.</Card>
        ) : (
          <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex justify-end gap-3 mb-2">
               <button onClick={handleDownloadCsv} className="px-4 py-2 border border-slate-700 rounded-xl text-textMuted hover:text-slate-200 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest leading-none">
                  <Download size={14} /> CSV
               </button>
               <button onClick={handleDownloadPdf} className="btn-primary !py-2 !px-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest leading-none">
                  <FileText size={14} /> Settlement Report (PDF)
               </button>
            </div>

            {/* Global Settlement Insights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <p className="text-textMuted text-xs uppercase font-bold tracking-widest mb-2">Total Monthly Libality</p>
                  <p className="text-3xl font-bold text-slate-200">
                    LKR {(Object.values(groupedData || {}).reduce((sum, t) => sum + (parseFloat(t.totalPayment) || 0), 0)).toLocaleString()}
                  </p>
               </div>
               <div className="bg-emerald-400/5 p-6 rounded-2xl border border-emerald-400/10 backdrop-blur-sm">
                  <p className="text-emerald-400 text-xs uppercase font-bold tracking-widest mb-2">Total Settled</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    LKR {(Object.values(groupedData || {}).reduce((sum, t) => sum + (parseFloat(getTotalReceived(t.tutorid)) || 0), 0)).toLocaleString()}
                  </p>
               </div>
               <div className="bg-danger/5 p-6 rounded-2xl border border-danger/10 backdrop-blur-sm">
                  <p className="text-danger text-xs uppercase font-bold tracking-widest mb-2">Total Outstanding</p>
                  <p className="text-3xl font-bold text-danger">
                    LKR {(Object.values(groupedData || {}).reduce((sum, t) => sum + (parseFloat(t.totalPayment) || 0), 0) - Object.values(groupedData || {}).reduce((sum, t) => sum + (parseFloat(getTotalReceived(t.tutorid)) || 0), 0)).toLocaleString()}
                  </p>
               </div>
               <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 backdrop-blur-sm">
                  <p className="text-primary text-xs uppercase font-bold tracking-widest mb-2">Settlement Rate</p>
                  <p className="text-3xl font-bold text-primary">
                    {((Object.values(groupedData).reduce((sum, t) => sum + getTotalReceived(t.tutorid), 0) / (Object.values(groupedData).reduce((sum, t) => sum + t.totalPayment, 0) || 1)) * 100).toFixed(1)}%
                  </p>
               </div>
            </div>

          {Object.values(groupedData).map((tutor, index) => {
            const totalReceived = getTotalReceived(tutor.tutorid);
            const pending = tutor.totalPayment - totalReceived;

            return (
              <Card key={index} title={`${tutor.firstname} ${tutor.lastname} — Summary`} className="relative overflow-hidden">
                {/* Decorative background icon */}
                <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
                    <Wallet size={120} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                   <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                      <p className="text-textMuted text-xs uppercase font-bold tracking-widest mb-1">Total Agreed Payment</p>
                      <p className="text-2xl font-bold text-slate-200">LKR {tutor.totalPayment.toFixed(2)}</p>
                   </div>
                   <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                      <p className="text-textMuted text-xs uppercase font-bold tracking-widest mb-1">Total Received</p>
                      <p className="text-2xl font-bold text-secondary">LKR {totalReceived.toFixed(2)}</p>
                   </div>
                   <div className={`p-4 rounded-xl border ${pending > 0 ? 'bg-danger/10 border-danger/20' : 'bg-secondary/10 border-secondary/20'}`}>
                      <p className={`${pending > 0 ? 'text-danger' : 'text-secondary'} text-xs uppercase font-bold tracking-widest mb-1`}>
                        {pending > 0 ? 'Outstanding Balance' : 'Fully Settled'}
                      </p>
                      <p className={`text-2xl font-bold ${pending > 0 ? 'text-danger' : 'text-secondary'}`}>LKR {pending.toFixed(2)}</p>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                   <div className="w-full md:w-2/3">
                      <h4 className="text-sm font-bold text-textMuted uppercase tracking-widest mb-4">Detailed Breakdown</h4>
                      <GenericTable 
                        columns={[
                          { label: 'Subject', accessor: 'subject', render: (val) => <span className="font-medium text-slate-200">{val}</span> },
                          { label: 'Grade', accessor: 'grade', render: (val) => <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">{val}</span> },
                          { label: 'Students', accessor: 'studentCount', render: (val) => <span className="text-secondary">{val}</span> },
                          { label: 'Amount', accessor: 'payment', render: (val) => <span className="font-bold">LKR {val.toFixed(2)}</span> }
                        ]}
                        data={tutor.breakdown}
                      />
                   </div>

                   <div className="w-full md:w-1/3 p-6 bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Update Payment Log</h4>
                      
                      {editingTutorId === tutor.tutorid ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormSelect 
                              label="Month"
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(Number(e.target.value))}
                              options={months.map(m => ({ label: m.name, value: m.value }))}
                            />
                            <FormSelect 
                              label="Year"
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(Number(e.target.value))}
                              options={[
                                { label: '2025', value: 2025 },
                                { label: '2026', value: 2026 }
                              ]}
                            />
                          </div>

                          <FormSelect 
                            label="Status"
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                            options={[
                              { label: 'Mark as Paid', value: 'PAID' },
                              { label: 'Mark as Pending', value: 'PENDING' }
                            ]}
                          />

                          {paymentType === 'PAID' && (
                            <FormInput 
                              label="Received Amount (LKR)"
                              type="number"
                              placeholder="Enter amount paid"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                          )}

                          <div className="flex gap-2 pt-2">
                             <button 
                               onClick={handleUpdateStatus}
                               className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary/80 transition-all flex items-center justify-center gap-2"
                             >
                               <ArrowUpCircle size={18} />
                               Save Log
                             </button>
                             <button 
                               onClick={cancelEditing}
                               className="px-4 py-2 border border-slate-700 rounded-lg text-textMuted hover:text-slate-200 transition-all"
                             >
                               Cancel
                             </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                           <p className="text-sm text-textMuted mb-4 italic">Update the payment history for this tutor to track settled balances.</p>
                           <button 
                             onClick={() => startEditing(tutor.tutorid)}
                             className="w-full bg-slate-800 text-slate-200 py-2.5 rounded-xl font-bold hover:bg-slate-700 border border-white/5 transition-all"
                           >
                             Log New Payment
                           </button>
                        </div>
                      )}
                   </div>
                </div>
              </Card>
            );
          })}
          </div>
        )}
    </Layout>
  );
};
