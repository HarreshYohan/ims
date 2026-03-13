import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {useAuth}  from '../../services/authContex';
import { useNavigate } from 'react-router-dom';
import {Header } from '../Header/Header'

import {Navbar} from '../Navbar/Navbar';
import {SectionHeader} from '../SectionHeader/SectionHeader';
import { Card } from '../shared/Card';
import { FileText } from 'lucide-react';

export const News = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate('/login');
  }
  return (
    <div className="flex flex-col min-h-screen text-textLight">
      <Header type="dashboard" action="Logout" />
      <Navbar /> 
      <SectionHeader section="News & Announcements" is_create={true} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 w-full animate-in fade-in duration-500 flex items-center justify-center">
        <Card className="max-w-2xl w-full text-center py-20 bg-slate-900/40">
           <div className="space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
                <FileText size={40} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Bulletin Board</h2>
              <p className="text-textMuted max-w-sm mx-auto">This section is currently under development. Soon you'll be able to publish news and announcements here.</p>
           </div>
        </Card>
      </main>
    </div>
  );
};

