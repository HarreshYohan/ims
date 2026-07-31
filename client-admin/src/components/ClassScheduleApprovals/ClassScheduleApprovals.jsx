import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { CheckCircle, XCircle } from 'lucide-react';
import { useFetch } from '../shared/useFetch';
import { jwtDecode } from 'jwt-decode';

export const ClassScheduleApprovals = () => {
  const { data, loading, refetch } = useFetch('/schedule-requests/admin');

  const handleStatusUpdate = async (id, action) => {
    try {
      await api.put(`/schedule-requests/admin/${id}`, { action });
      toast.success(`Request ${action.toLowerCase()} successfully`);
      refetch();
    } catch (err) {
      toast.error('Failed to update schedule request');
    }
  };

  const columns = [
    { label: 'Tutor', accessor: 'subjectTutor', render: (val) => <span className="font-medium text-slate-200">{val?.tutor?.firstname} {val?.tutor?.lastname}</span> },
    { label: 'Subject', accessor: 'subjectTutor', render: (val) => <span className="text-secondary">{val?.subject?.name} - {val?.grade?.name}</span> },
    { label: 'Classroom', accessor: 'classroom', render: (val) => val?.name },
    { label: 'Requested By Admin', accessor: 'day_of_week', render: (val, row) => <span className="text-sm">Day: {val}, Slot: {row.timeslotid}</span> },
    { label: 'Tutor Proposal', accessor: 'tutor_preferred_day', render: (val, row) => val ? <span className="text-amber-500 text-sm font-medium">Day: {val}, Slot: {row.tutor_preferred_timeslotid}</span> : <span className="text-textMuted text-xs">None</span> },
    { 
      label: 'Status', 
      accessor: 'status', 
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          val === 'APPROVED' ? 'bg-secondary/20 text-secondary' : 
          val === 'PENDING_ADMIN' ? 'bg-amber-500/20 text-amber-500' :
          val === 'PENDING_TUTOR' ? 'bg-blue-500/20 text-blue-500' : 'bg-danger/20 text-danger'
        }`}>{val.replace(/_/g, ' ')}</span>
      ) 
    },
    {
      label: 'Actions',
      accessor: 'id',
      render: (val, row) => row.status === 'PENDING_ADMIN' ? (
        <div className="flex gap-2">
          <button onClick={() => handleStatusUpdate(val, 'APPROVE')} className="text-secondary hover:text-emerald-400" title="Approve Tutor's Time"><CheckCircle size={18} /></button>
          <button onClick={() => handleStatusUpdate(val, 'REJECT')} className="text-danger hover:text-rose-400" title="Reject Tutor's Time"><XCircle size={18} /></button>
        </div>
      ) : <span className="text-textMuted text-xs">N/A</span>
    }
  ];

  return (
    <Layout title="Timetable Approvals">
      <Card title="Tutor Class Schedule Requests">
        <GenericTable columns={columns} data={data} loading={loading} emptyStateMessage="No schedule requests found." />
      </Card>
    </Layout>
  );
};
