import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { 
  Activity, Search, Filter, Clock, User, Shield,
  LogIn, Plus, Pencil, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';

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
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-textMuted uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
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
        <div className="overflow-x-auto custom-scrollbar mt-4">
          {loading ? (
            <div className="text-center text-textMuted py-12">Loading activity logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-textMuted py-12">No activity logs found.</div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="py-3 px-3 text-textMuted text-xs uppercase tracking-wider font-medium">Time</th>
                  <th className="py-3 px-3 text-textMuted text-xs uppercase tracking-wider font-medium">Action</th>
                  <th className="py-3 px-3 text-textMuted text-xs uppercase tracking-wider font-medium">User</th>
                  <th className="py-3 px-3 text-textMuted text-xs uppercase tracking-wider font-medium">Role</th>
                  <th className="py-3 px-3 text-textMuted text-xs uppercase tracking-wider font-medium">Entity</th>
                  <th className="py-3 px-3 text-textMuted text-xs uppercase tracking-wider font-medium">Details</th>
                  <th className="py-3 px-3 text-textMuted text-xs uppercase tracking-wider font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logs.map((log) => {
                  const actionStyle = ACTION_ICONS[log.action] || ACTION_ICONS.CREATE;
                  const badge = ACTION_BADGE[log.action] || ACTION_BADGE.CREATE;
                  const ActionIcon = actionStyle.icon;
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-500" />
                          <span className="text-sm text-slate-300">{formatTime(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge}`}>
                          <ActionIcon size={12} />
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <p className="text-sm font-medium text-white">{log.username || '—'}</p>
                          <p className="text-xs text-textMuted">{log.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                          {log.role || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-sm text-slate-300 capitalize">{log.entity || '—'}</span>
                        {log.entity_id && <span className="text-xs text-textMuted ml-1">#{log.entity_id}</span>}
                      </td>
                      <td className="py-3 px-3 max-w-[300px]">
                        <p className="text-sm text-slate-400 truncate" title={log.details}>{log.details || '—'}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-slate-500 font-mono">{log.ip_address || '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center border-t border-slate-700/50 pt-4">
            <span className="text-sm text-textMuted">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                <ChevronLeft size={16} /> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
};
