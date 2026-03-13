import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { Users, UserSquare2, ShieldCheck, GraduationCap } from 'lucide-react';

export const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsByGrade, setStudentsByGrade] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [classesByGrade, setClassesByGrade] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        const data = response.data;

        setTotalStudents(data.totalStudents);
        setStudentsByGrade(data.studentsByGrade || []);
        setTotalTeachers(data.totalTeachers);
        setTotalStaff(data.totalStaff);
        setClassesByGrade(data.nextClasses || {});
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const gradeColumns = [
    { label: 'Grade Level', accessor: 'grade' },
    { label: 'Total Students', accessor: 'count', render: (val) => <span className="text-secondary font-medium">{val}</span> },
  ];

  const classColumns = [
    { label: 'Time', accessor: 'timeslot' },
    { label: 'Room', accessor: 'classroom', render: (val) => <span className="bg-slate-700/50 px-2 py-1 rounded text-xs">{val}</span> },
    { label: 'Subject', accessor: 'subject', render: (val) => <span className="text-primary font-medium">{val}</span> },
    { label: 'Tutor', accessor: 'tutor' },
  ];

  return (
    <Layout title="Dashboard">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-6 border-l-4 border-l-primary">
          <div className="p-4 bg-primary/20 rounded-xl text-primary">
            <GraduationCap size={32} />
          </div>
          <div>
            <p className="text-textMuted text-sm uppercase tracking-wider font-semibold">Total Students</p>
            <h3 className="text-4xl font-bold text-white mt-1">{totalStudents}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center gap-6 border-l-4 border-l-secondary">
          <div className="p-4 bg-secondary/20 rounded-xl text-secondary">
            <UserSquare2 size={32} />
          </div>
          <div>
            <p className="text-textMuted text-sm uppercase tracking-wider font-semibold">Total Teachers</p>
            <h3 className="text-4xl font-bold text-white mt-1">{totalTeachers}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center gap-6 border-l-4 border-l-emerald-400">
          <div className="p-4 bg-emerald-400/20 rounded-xl text-emerald-400">
            <ShieldCheck size={32} />
          </div>
          <div>
            <p className="text-textMuted text-sm uppercase tracking-wider font-semibold">Total Staff</p>
            <h3 className="text-4xl font-bold text-white mt-1">{totalStaff}</h3>
          </div>
        </Card>
      </div>

      {/* Data Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Grades Breakdown */}
        <div className="lg:col-span-1">
          <Card title="Student Distribution">
            <GenericTable 
              columns={gradeColumns} 
              data={studentsByGrade} 
              loading={loading}
              emptyStateMessage="No students found."
            />
          </Card>
        </div>

        {/* Right Column: Today's Classes */}
        <div className="lg:col-span-2 space-y-6">
          {Object.keys(classesByGrade).length === 0 && !loading ? (
            <Card>
              <div className="py-12 text-center text-textMuted flex flex-col items-center">
                <Users size={48} className="opacity-20 mb-4" />
                <p>No classes scheduled for today.</p>
              </div>
            </Card>
          ) : Object.entries(classesByGrade).map(([grade, classes], index) => (
            <Card key={index} title={`${grade} — Today's Schedule`}>
               <GenericTable 
                 columns={classColumns} 
                 data={classes} 
                 loading={loading}
               />
            </Card>
          ))}
        </div>
        
      </div>
    </Layout>
  );
};
