import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Download, FileText, Table as TableIcon, 
  BarChart3, PieChart as PieChartIcon, Activity, Calendar, DownloadCloud,
  ChevronRight, Sparkles, Filter, Clock
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export const AnalyticsDashboard = () => {
  const [userType, setUserType] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setUserType(decoded.user_type);
      fetchAnalytics(decoded.user_type);
    }
  }, []);

  const fetchAnalytics = async (role) => {
    try {
      const res = await api.get(`/analytics/${role.toLowerCase()}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    setIsDownloading(true);
    try {
      const endpoint = format === 'pdf' ? `/reports/pdf/${userType.toLowerCase()}` : `/reports/csv/${userType.toLowerCase()}`;
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IMS_${userType}_Report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Download failed:`, err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <Layout title="AI Insights & Forecasting"><div className="flex items-center justify-center h-64 text-textMuted">Crunching data for you...</div></Layout>;
  if (!data) return <Layout title="AI Insights & Forecasting"><div className="text-center text-danger py-10">Failed to load analytics. Please try again later.</div></Layout>;

  const StatTile = ({ label, value, sub, icon: Icon, color }) => (
    <div className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}/20 text-${color}`}>
          <Icon size={20} className={`text-${color}-400`} />
        </div>
        {sub?.trend === 'up' && <span className="text-emerald-400 text-xs flex items-center gap-0.5"><TrendingUp size={12}/> +{sub.val}%</span>}
        {sub?.trend === 'down' && <span className="text-rose-400 text-xs flex items-center gap-0.5"><TrendingDown size={12}/> -{sub.val}%</span>}
      </div>
      <p className="text-2xl font-bold text-slate-200 tracking-tight">{value}</p>
      <p className="text-xs text-textMuted uppercase tracking-wider font-medium">{label}</p>
    </div>
  );

  return (
    <Layout title={<div className="flex items-center gap-2">AI Insights & Forecasting <Sparkles size={20} className="text-primary animate-pulse"/></div>}>
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-textMuted">Personalized data-driven forecasts & metrics for your role.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => downloadReport('csv')} 
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-500 hover:bg-slate-700 transition-colors border border-slate-700 text-sm font-medium"
          >
            <DownloadCloud size={18}/> CSV
          </button>
          <button 
            onClick={() => downloadReport('pdf')} 
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm font-medium"
          >
            <FileText size={18}/> Download Intelligence PDF
          </button>
        </div>
      </div>

      {/* ADMIN DASHBOARD */}
      {userType === 'ADMIN' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile icon={GraduationCapIcon} label="Total Students" value={data.stats.student_count} sub={{trend: 'up', val: 12}} color="indigo" />
            <StatTile icon={BarChart3} label="Total Revenue" value={`$${data.stats.total_revenue.toLocaleString()}`} sub={{trend: 'up', val: 8}} color="emerald" />
            <StatTile icon={Activity} label="Monthly Expenses" value={`$${data.stats.total_expenses.toLocaleString()}`} sub={{trend: 'down', val: 3}} color="rose" />
            <StatTile icon={PieChartIcon} label="Profit Margin" value={`${((data.stats.total_revenue - data.stats.total_expenses) / data.stats.total_revenue * 100).toFixed(1)}%`} color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Revenue & Expense Forecast (6mo)">
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue_forecast.labels.map((l, i) => ({
                    name: l,
                    Actual: data.revenue_forecast.income[i],
                    Forecast: data.revenue_forecast.forecast_income[i],
                    Expense: data.revenue_forecast.expense[i]
                  }))}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="Actual" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                    <Area type="monotone" dataKey="Forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Subject Enrollment Popularity">
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.top_subjects.map(s => ({ subject: s.subject, val: s.enrollment_count }))}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                    <Radar name="Students" dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px'}} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* STUDENT DASHBOARD */}
      {userType === 'STUDENT' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatTile icon={Sparkles} label="Predicted Grade" value={data.grade_prediction.predicted_grade || 'N/A'} sub={{trend: data.grade_prediction.trend, val: 5}} color="primary" />
            <StatTile icon={BarChart3} label="Avg Quiz Score" value={`${(data.quiz_scores.reduce((a,b)=>a+b.score_percent,0)/data.quiz_scores.length || 0).toFixed(1)}%`} color="indigo" />
            <StatTile icon={Clock} label="Notes Created" value={data.notes_summary.reduce((a,b)=>a+parseInt(b.count),0)} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="My Score Progress">
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.quiz_scores.map(q => ({ name: q.subject, score: q.score_percent }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px'}} />
                    <Line type="smooth" dataKey="score" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Flashcard Mastery per Subject">
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.flashcard_stats.map(f => ({ name: f.subject, Mastered: f.mastered, Learning: f.learning }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip cursor={{fill: '#334155'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px'}} />
                    <Legend />
                    <Bar dataKey="Mastered" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Learning" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Placeholder for Staff/Tutor which follow the same pattern */}
      {(userType === 'STAFF' || userType === 'TUTOR') && (
        <div className="flex flex-col items-center justify-center p-20 glass-card">
           <BarChart3 size={48} className="text-primary mb-4 opacity-50"/>
           <h3 className="text-xl font-bold text-slate-200 mb-2">{userType} Analytics Ready</h3>
           <p className="text-textMuted text-center max-w-md">Your personalized analytics dashboard is active. Download the intelligence report to see full forecasts.</p>
        </div>
      )}
    </Layout>
  );
};

// Simple icon wrapper
const GraduationCapIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);
