import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { 
  Activity, Search, Filter, Clock, User, Shield,
  LogIn, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Eye 
} from 'lucide-react';
import { GenericTable } from '../shared/GenericTable';
import { Modal } from '../shared/Modal';

const ACTION_ICONS = {
  LOGIN:  { icon: LogIn,  color: 'text-emerald-400 bg-emerald-500/10' },
  LOGOUT: { icon: LogIn,  color: 'text-amber-400 bg-amber-500/10' },
  CREATE: { icon: Plus,   color: 'text-blue-400 bg-blue-500/10' },
  UPDATE: { icon: Pencil, color: 'text-purple-400 bg-purple-500/10' },
  DELETE: { icon: Trash2, color: 'text-red-400 bg-red-500/10' },
};

const ACTION_BADGE = {
  LOGIN:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  LOGOUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CREATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  UPDATE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', action: '', role: '', entity: '' });
  
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (filters.search) params.search = filters.search;
      if (filters.action) params.action = filters.action;
      if (filters.role) params.role = filters.role;
      if (filters.entity) params.entity = filters.entity;

      const [logsRes, statsRes] = await Promise.all([
        api.get('/activity-logs/all', { params }),
        api.get('/activity-logs/stats'),
      ]);

      setLogs(logsRes.data.data || []);
      setTotalPages(logsRes.data.totalPages || 1);
      setStats(statsRes.data || {});
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: searchInput })), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-slate-200" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-200">{value}</p>
        <p className="text-xs text-textMuted uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const columns = [
    { 
      label: 'Time', 
      accessor: 'created_at', 
      render: (val) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-500" />
          <span className="text-sm text-slate-500">{formatTime(val)}</span>
        </div>
      )
    },
    { 
      label: 'Action', 
      accessor: 'action',
      render: (val) => {
        const style = ACTION_ICONS[val] || ACTION_ICONS.CREATE;
        const badge = ACTION_BADGE[val] || ACTION_BADGE.CREATE;
        const ActionIcon = style.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge}`}>
            <ActionIcon size={12} />
            {val}
          </span>
        );
      }
    },
    { 
      label: 'User', 
      accessor: 'username',
      render: (val, row) => (
        <div>
          <p className="text-sm font-medium text-slate-200">{val || '—'}</p>
          <p className="text-xs text-textMuted">{row.email || ''}</p>
        </div>
      )
    },
    { 
      label: 'Role', 
      accessor: 'role',
      render: (val) => (
        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
          {val || '—'}
        </span>
      )
    },
    { 
      label: 'Entity', 
      accessor: 'entity',
      render: (val, row) => (
        <span className="text-sm text-slate-500 capitalize">
          {val || '—'}
          {row.entity_id && <span className="text-xs text-textMuted ml-1">#{row.entity_id}</span>}
        </span>
      )
    },
    { 
      label: 'Details', 
      accessor: 'details',
      render: (val) => (
        <p className="text-sm text-slate-500 truncate max-w-[200px]" title={val}>{val || '—'}</p>
      )
    },
    {
      label: 'IP Address',
      accessor: 'ip_address',
      render: (val) => <span className="text-xs text-slate-500 font-mono">{val || '—'}</span>
    }
  ];

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  return (
    <Layout title="Activity Log">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Events" value={stats.total || 0} icon={Activity} color="bg-indigo-500" />
        <StatCard label="Logins" value={stats.logins || 0} icon={LogIn} color="bg-emerald-500" />
        <StatCard label="Creates" value={stats.creates || 0} icon={Plus} color="bg-blue-500" />
        <StatCard label="Updates" value={stats.updates || 0} icon={Pencil} color="bg-purple-500" />
        <StatCard label="Deletes" value={stats.deletes || 0} icon={Trash2} color="bg-red-500" />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <FormInput
              placeholder="Search by user, email, or action..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
              className="!mb-0"
            />
          </div>
          <div className="w-full md:w-40">
            <FormSelect
              name="action" value={filters.action}
              onChange={(e) => { setFilters(f => ({...f, action: e.target.value})); setPage(1); }}
              options={[
                { label: 'All Actions', value: '' },
                { label: 'Login', value: 'LOGIN' },
                { label: 'Create', value: 'CREATE' },
                { label: 'Update', value: 'UPDATE' },
                { label: 'Delete', value: 'DELETE' },
              ]}
            />
          </div>
          <div className="w-full md:w-40">
            <FormSelect
              name="role" value={filters.role}
              onChange={(e) => { setFilters(f => ({...f, role: e.target.value})); setPage(1); }}
              options={[
                { label: 'All Roles', value: '' },
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Staff', value: 'STAFF' },
                { label: 'Tutor', value: 'TUTOR' },
                { label: 'Student', value: 'STUDENT' },
              ]}
            />
          </div>
          <div className="w-full md:w-40">
            <FormSelect
              name="entity" value={filters.entity}
              onChange={(e) => { setFilters(f => ({...f, entity: e.target.value})); setPage(1); }}
              options={[
                { label: 'All Entities', value: '' },
                { label: 'User', value: 'user' },
                { label: 'Student', value: 'student' },
                { label: 'Tutor', value: 'tutor' },
                { label: 'Staff', value: 'staff' },
                { label: 'Classroom', value: 'classroom' },
                { label: 'Timetable', value: 'timetable' },
                { label: 'Transaction', value: 'transaction' },
                { label: 'Grade', value: 'grade' },
                { label: 'Notes', value: 'notes' },
                { label: 'Goals', value: 'goals' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Log Table */}
      <Card title="Audit Trail">
        <GenericTable 
          columns={columns} 
          data={logs} 
          loading={loading}
          onRowClick={handleRowClick}
          pagination={{
            current: page,
            total: totalPages,
            onPageChange: (p) => setPage(p)
          }}
        />
      </Card>

      {/* Log Detail Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Activity Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-textMuted font-semibold">User Information</label>
                  <div className="mt-2 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                    <p className="text-slate-200 font-medium">{selectedLog.username || 'Anonymous'}</p>
                    <p className="text-sm text-textMuted">{selectedLog.email || 'No email provided'}</p>
                    <div className="mt-2 inline-block bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold">
                      {selectedLog.role || 'GUEST'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-textMuted font-semibold">Event Metadata</label>
                  <div className="mt-2 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-textMuted">Timestamp</span>
                      <span className="text-slate-200">{formatTime(selectedLog.created_at)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-textMuted">IP Address</span>
                      <span className="text-slate-200 font-mono">{selectedLog.ip_address || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-textMuted">Action Type</span>
                      <span className="text-slate-200 font-bold">{selectedLog.action}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-textMuted font-semibold">Target Entity</label>
                  <div className="mt-2 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                    <p className="text-lg text-slate-200 capitalize font-semibold">{selectedLog.entity || 'Generic'}</p>
                    {selectedLog.entity_id && (
                      <p className="text-sm text-textMuted mt-1">
                        Resource ID: <span className="text-primary font-mono font-bold">#{selectedLog.entity_id}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-textMuted font-semibold">Activity Details</label>
                  <div className="mt-2 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 min-h-[100px]">
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "{selectedLog.details || 'No additional details logged for this event.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
