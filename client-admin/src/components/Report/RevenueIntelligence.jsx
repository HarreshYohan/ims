import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { TrendingUp, DollarSign, Users, Award, Zap, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const RevenueIntelligence = () => {
  const [data, setData] = useState([]);
  const [subjectFees, setSubjectFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, subjectRes] = await Promise.all([
          api.get('/tutor-payments/summary'),
          api.get('/subject-tutors/all')
        ]);
        setData(summaryRes.data.data);
        setSubjectFees(subjectRes.data.data);
      } catch (err) {
        console.error('Failed to fetch intelligence data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const profitabilityData = useMemo(() => {
    if (!data.length || !subjectFees.length) return [];

    return data.map(item => {
      // Use robust matching (trim and case-insensitive)
      const subjectConfig = subjectFees.find(s => 
        s.subject?.trim().toLowerCase() === item.subject?.trim().toLowerCase() && 
        s.grade?.trim().toLowerCase() === item.grade?.trim().toLowerCase()
      );
      
      const tutorCostPerStudent = parseFloat(subjectConfig?.fees) || 0;
      const studentCount = parseInt(item?.studentCount) || 0;
      const tutorTotalCost = parseFloat(item?.totalPayment) || 0;
      
      // INDUSTRY LOGIC: Assume a 40% markup for the institute revenue
      // If the tutor cost is 2000, we'll assume the student paid 2800 (40% markup)
      const markupFactor = 1.4; 
      const totalRevenue = tutorTotalCost * markupFactor;
      const profit = totalRevenue - tutorTotalCost;
      const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      return {
        subject: `${item?.subject || 'Unknown'} (${item?.grade || 'N/A'})`,
        revenue: Math.round(totalRevenue),
        tutorCost: Math.round(tutorTotalCost),
        profit: Math.round(profit),
        margin: margin.toFixed(1),
        students: studentCount || 0
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [data, subjectFees]);

  const handleDownloadCsv = () => {
    const headers = ['Subject (Grade)', 'Students', 'Revenue', 'Tutor Cost', 'Profit', 'Margin %'];
    const rows = profitabilityData.map(d => [
      d.subject, d.students, d.revenue, d.tutorCost, d.profit, d.margin
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenue_intelligence_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  const handleDownloadPdf = async () => {
    const element = document.querySelector('main');
    const canvas = await html2canvas(element, { backgroundColor: '#0f172a' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`revenue_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const totalMonthlyProfit = useMemo(() => (profitabilityData || []).reduce((sum, item) => sum + (parseFloat(item.profit) || 0), 0), [profitabilityData]);
  const totalMonthlyRevenue = useMemo(() => (profitabilityData || []).reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0), [profitabilityData]);
  const totalStudents = useMemo(() => (profitabilityData || []).reduce((sum, item) => sum + (parseInt(item.students) || 0), 0), [profitabilityData]);
  const overallMargin = totalMonthlyRevenue > 0 ? (totalMonthlyProfit / totalMonthlyRevenue) * 100 : 0;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  return (
    <Layout title="Revenue Intelligence" maxWidth="max-w-[1600px]">
      {/* Header Actions */}
      <div className="flex justify-end gap-3 mb-2">
         <button onClick={handleDownloadCsv} className="px-4 py-2 border border-slate-700 rounded-xl text-textMuted hover:text-white transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Download size={14} /> CSV
         </button>
         <button onClick={handleDownloadPdf} className="btn-primary !py-2 !px-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <FileText size={14} /> Export Business Report
         </button>
      </div>

      {/* Top Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InsightCard 
          title="Est. Monthly Profit" 
          value={`LKR ${(totalMonthlyProfit || 0).toLocaleString()}`} 
          sub="Post-tutor settlements"
          icon={<DollarSign size={20} />}
          color="text-emerald-400"
        />
        <InsightCard 
          title="Operating Margin" 
          value={`${(overallMargin || 0).toFixed(1)}%`} 
          sub="Gross profitability rate"
          icon={<TrendingUp size={20} />}
          color="text-primary"
        />
        <InsightCard 
          title="Active Enrollments" 
          value={(totalStudents || 0).toLocaleString()} 
          sub="Across all subjects"
          icon={<Users size={20} />}
          color="text-amber-400"
        />        <InsightCard 
          title="Top Performer" 
          value={profitabilityData[0]?.subject || 'N/A'} 
          sub="Highest profit generator"
          icon={<Award size={20} />}
          color="text-pink-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profitability Chart */}
        <Card title="Subject Profitability Analysis" className="lg:col-span-2">
          <div className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData.slice(0, 15)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `LKR ${v/1000}k`} />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={10} width={120} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff' }}
                   formatter={(v, name) => [`LKR ${(v || 0).toLocaleString()}`, name === 'revenue' ? 'Gross Revenue' : 'Net Profit']}
                />
                <Bar dataKey="revenue" fill="#1e293b" stroke="#6366f1" radius={[0, 4, 4, 0]} barSize={15} name="revenue" />
                <Bar dataKey="profit" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} name="profit">
                   {profitabilityData.slice(0, 15).map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Mix */}
        <Card title="Revenue Distribution">
           <div className="h-[300px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profitabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {profitabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                     itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-6 space-y-3">
              {profitabilityData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-textMuted">{item.subject}</span>
                   </div>
                   <span className="font-bold text-white">{((item.revenue / (totalMonthlyRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card title="Operational Efficiency Metrics">
        <GenericTable 
          columns={[
            { label: 'Subject / Grade', accessor: 'subject' },
            { label: 'Qty', accessor: 'students', render: (v) => <span className="font-bold">{(v || 0)} Students</span> },
            { label: 'Revenue', accessor: 'revenue', render: (v) => <span className="text-textMuted">LKR {(v || 0).toLocaleString()}</span> },
            { label: 'Tutor Expense', accessor: 'tutorCost', render: (v) => <span className="text-danger/70">LKR {(v || 0).toLocaleString()}</span> },
            { label: 'Net Profit', accessor: 'profit', render: (v) => <span className="text-emerald-400 font-bold">LKR {(v || 0).toLocaleString()}</span> },            { label: 'Efficiency', accessor: 'margin', render: (v) => (
              <div className="flex items-center gap-2">
                 <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-20">
                    <div className="h-full bg-primary" style={{ width: `${v}%` }} />
                 </div>
                 <span className="text-xs font-bold text-primary">{v}%</span>
              </div>
            )}
          ]}
          data={profitabilityData}
          loading={loading}
        />
      </Card>
    </Layout>
  );
};

const InsightCard = ({ title, value, sub, icon, color }) => (
  <Card className="relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-white/10 transition-all">
       {React.cloneElement(icon, { size: 100 })}
    </div>
    <p className="text-textMuted text-xs uppercase font-bold tracking-widest mb-1">{title}</p>
    <div className={`text-2xl font-black ${color} mb-1`}>{value}</div>
    <p className="text-[10px] text-textMuted font-medium uppercase">{sub}</p>
  </Card>
);
