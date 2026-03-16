import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {useAuth}  from '../../services/authContex';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { FileText, Users, CreditCard, TrendingUp, BarChart2, ShieldCheck } from 'lucide-react';

export const Report = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate('/login');
  }
  return (
    <Layout title="System Reports">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <ReportCard 
          title="User Analytics" 
          desc="Registration trends, role distributions, and user growth insights." 
          icon={<Users className="text-primary" size={24} />} 
          path="/user-report" 
          onClick={() => navigate('/user-report')}
        />
        <ReportCard 
          title="Financial Performance" 
          desc="Transaction logs, income vs expenses, and cashflow health." 
          icon={<CreditCard className="text-secondary" size={24} />} 
          path="/transaction" 
          onClick={() => navigate('/transaction')}
        />
        <ReportCard 
          title="Tutor Settlements" 
          desc="Payment statuses, outstanding balances, and settlement history." 
          icon={<ShieldCheck className="text-emerald-400" size={24} />} 
          path="/tutor-payment" 
          onClick={() => navigate('/tutor-payment')}
        />
        <ReportCard 
          title="Revenue Intelligence" 
          desc="Profitability per subject and operational efficiency metrics." 
          icon={<TrendingUp className="text-amber-400" size={24} />} 
          path="/revenue" 
          badge="Premium"
          onClick={() => navigate('/revenue')}
        />
        <ReportCard 
          title="Staff Salaries" 
          desc="Manage staff position settlements and monthly salary history." 
          icon={<ShieldCheck className="text-violet-400" size={24} />} 
          path="/staff-payment" 
          onClick={() => navigate('/staff-payment')}
        />
        <ReportCard 
          title="Academic Insights" 
          desc="Grade performance and classroom capacity utilization." 
          icon={<BarChart2 className="text-pink-400" size={24} />} 
          path="/classroom" 
          onClick={() => navigate('/classroom')}
        />
      </div>
    </Layout>
  );
};

const ReportCard = ({ title, desc, icon, badge, onClick }) => (
  <Card className="hover:border-primary/50 transition-all cursor-pointer group" onClick={onClick}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {badge && (
        <span className="px-2 py-1 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-lg font-bold text-slate-200 mb-2">{title}</h3>
    <p className="text-sm text-textMuted leading-relaxed">{desc}</p>
    <div className="mt-6 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
      View Report →
    </div>
  </Card>
);

