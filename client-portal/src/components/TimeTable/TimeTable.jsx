import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormSelect } from '../shared/FormSelect';
import { useFetch } from '../shared/useFetch';
import { Edit3, Trash2, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { GenericTable } from '../shared/GenericTable';

export const Timetable = () => {
  const [uid, setUid] = useState(null);
  const [userType, setUserType] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserType(decoded.user_type);
        setUid(decoded.user_id);
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    }
  }, []);

  const canEdit = userType === 'ADMIN' || userType === 'STAFF';
  const isStudent = userType === 'STUDENT';

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({ id: null, day: null, timeslotid: null });
  const [classroomid, setClassroomid] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [subjectTutorid, setSubjectTutorid] = useState('');
  const [subjectTutors, setSubjectTutors] = useState([]);

  const fetchUrl = isStudent 
    ? `/timetable/student/${uid}` 
    : (userType === 'TUTOR' ? `/timetable/tutor/${uid}` : '/timetable/all');

  const { data, loading, pagination, refetch } = useFetch(fetchUrl, { 
    classroomid: (!isStudent && userType !== 'TUTOR') ? classroomid : undefined,
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [clsRes, stRes] = await Promise.all([
          api.get('/classrooms/all'),
          api.get('/subject-tutors/all')
        ]);
        setClassrooms(clsRes.data.data || []);
        setSubjectTutors(stRes.data.data || []);
        
        if (clsRes.data.data?.length > 0 && !classroomid) {
            setClassroomid(clsRes.data.data[0].id);
        }
      } catch (err) {
        console.error('Dropdown fetch failed', err);
      }
    };
    fetchDropdowns();
  }, [classroomid]);

  const handleEdit = (id, day, timeslotid) => {
    setEditData({ id, day, timeslotid });
    setSubjectTutorid('');
    setShowModal(true);
  };

  const handleDelete = async (id, timeslotid, day) => {
    if (window.confirm('Are you sure you want to remove this class from the timetable?')) {
      try {
        await api.delete(`/timetable/${id}`, {
          params: { day, timeslotid }
        });
        toast.success('Timetable item removed');
        refetch();
      } catch (err) {
        toast.error('Error deleting item');
        console.error('Error deleting timetable item:', err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!subjectTutorid) {
      toast.error("Please select a valid subject tutor mapping.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post(`/timetable`, {
        subjecttutorid: Number(subjectTutorid),
        classroomid: Number(classroomid),
        timeslotid: Number(editData.timeslotid),
        day: editData.day,
      });
      toast.success('Timetable updated');
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error('Failed to update timetable');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  const selectedClassroom = classrooms.find(c => String(c.id) === String(classroomid));
  const classroomName = selectedClassroom?.name || 'Classroom';
  const classroomCapacity = selectedClassroom?.capacity || '-';

  const studentColumns = [
    { label: 'Day', accessor: 'day', render: (val) => <span className="capitalize font-medium text-slate-200">{val}</span> },
    { label: 'Timeslot', accessor: 'timeslot' },
    { label: 'Subject', accessor: 'subject' },
    { label: 'Syllabus', accessor: 'syllabus' },
    { label: 'Tutor', accessor: 'tutor' },
    { label: 'Grade', accessor: 'grade', render: (val) => <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">{val}</span> },
    { label: 'Classroom', accessor: 'classroom' },
  ];

  return (
    <Layout title="Time Table">
        {(!isStudent && userType !== 'TUTOR') && (
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 rounded-xl glass-card backdrop-blur-xl border border-slate-700/50 items-center">
              <div className="flex items-center gap-2 text-textMuted mr-2">
                <CalendarIcon size={18} /> <span className="font-medium text-sm uppercase tracking-wider">Select Classroom</span>
              </div>
              <div className="flex-1 md:max-w-xs">
                <FormSelect 
                  name="classroomFilter" 
                  value={classroomid} 
                  onChange={(e) => setClassroomid(e.target.value)}
                  options={classrooms.map(c => ({ label: c.name, value: c.id }))}
                  placeholder="Choose Classroom"
                />
              </div>
              <div className="flex-1 text-right text-textMuted text-xs italic">
                  {classroomCapacity !== '-' && `Max Capacity: ${classroomCapacity} students`}
              </div>
          </div>
        )}

        <Card>
          {(!isStudent && userType !== 'TUTOR') && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-700/50 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Viewing Schedule: <span className="text-primary">{classroomName}</span>
                </h2>
              </div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar pb-4">
            {loading ? (
              <div className="p-8 text-center text-textMuted">Loading timetable...</div>
            ) : (isStudent || userType === 'TUTOR') ? (
              <div className="space-y-4">
                <GenericTable 
                  columns={studentColumns} 
                  data={data} 
                  loading={loading}
                  emptyStateMessage="No classes scheduled for you."
                />
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="py-4 px-2 text-textMuted font-medium w-[120px]">Timeslot</th>
                    {daysOfWeek.map(day => (
                      <th key={day.key} className="py-4 px-2 text-center text-secondary font-medium uppercase tracking-wider text-sm">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.map((item) => (
                    <tr key={`${item.timeslotid}-${item.classroomid}`} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-2 whitespace-nowrap">
                        <span className="bg-slate-800/60 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700/50">
                          {item.timeslot}
                        </span>
                      </td>
                      {daysOfWeek.map(day => {
                        const cellData = item[`${day.key}cls`];
                        return (
                          <td key={day.key} className="py-3 px-2 min-w-[140px] text-center align-top relative">
                            {cellData ? (
                              <div className="bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl p-3 transition-colors h-full flex flex-col justify-center items-center group/cell">
                                {canEdit && (
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(item.classroomid, day.key, item.timeslotid)} className="p-1 rounded hover:bg-black/20 text-textMuted hover:text-primary transition-colors" title="Edit Class">
                                      <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(item.classroomid, item.timeslotid, day.key)} className="p-1 rounded hover:bg-black/20 text-textMuted hover:text-danger transition-colors" title="Remove Class">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 block bg-primary/10 px-2 py-0.5 rounded-full">{cellData.grade.name} • {cellData.syllabus?.name || 'N/A'}</span>
                                <span className="text-sm font-medium text-white block truncate w-full" title={cellData.subject.name}>{cellData.subject.name}</span>
                                <span className="text-xs text-textMuted mt-1 block truncate w-full">{cellData.tutor.title} {cellData.tutor.firstname}</span>
                              </div>
                            ) : (
                              canEdit ? (
                                <div className="h-full w-full min-h-[80px] rounded-xl border border-dashed border-slate-700/50 flex items-center justify-center hover:bg-slate-800/30 transition-colors group/empty cursor-pointer" onClick={() => handleEdit(item.classroomid, day.key, item.timeslotid)}>
                                  <PlusCircle size={20} className="text-slate-600 group-hover/empty:text-primary transition-colors" />
                                </div>
                              ) : (
                                <div className="h-full w-full min-h-[80px] rounded-xl border border-dashed border-slate-700/30 flex items-center justify-center">
                                  <span className="text-slate-700 text-xs">—</span>
                                </div>
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {data.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-textMuted">No timetable data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Basic pagination controls wrapper since Timetable didn't seamlessly use the GenericTable */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-700/50 pt-4">
             <span className="text-sm text-textMuted">
                Page {pagination.currentPage} of {pagination.totalPages || 1}
             </span>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => pagination.handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => pagination.handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        pagination.currentPage === pageNum 
                          ? 'bg-primary text-white border border-primary' 
                          : 'border border-transparent text-textMuted hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => pagination.handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
             </div>
          </div>
        </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule Class">
        <form onSubmit={handleSave}>
          <div className="space-y-5">
            <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700/50">
              <div>
                <span className="text-xs text-textMuted uppercase block mb-1">Schedule Day</span>
                <span className="font-bold text-primary capitalize">{editData.day}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-textMuted uppercase block mb-1">Time Window</span>
                <span className="font-bold text-emerald-400">
                  {data.find(d => d.timeslotid === editData.timeslotid)?.timeslot || `Slot #${editData.timeslotid}`}
                </span>
              </div>
            </div>

            <FormSelect 
              label="Subject Tutor Allocation" 
              name="subjectTutorid" 
              value={subjectTutorid} 
              onChange={(e) => setSubjectTutorid(e.target.value)}
              options={subjectTutors.map(tutor => ({
                value: tutor.id,
                label: `${tutor.grade} • ${tutor.subject} (${tutor.syllabus || 'N/A'}) • ${tutor.tutor}`
              }))}
              required
            />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
