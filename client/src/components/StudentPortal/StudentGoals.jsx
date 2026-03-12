import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { Target, PlusCircle, Flame, TrendingUp, CheckCircle, Clock, Trash2 } from 'lucide-react';

export const StudentGoals = () => {
  const [userId, setUserId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ goaltitle: '', targetdate: '' });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchStudentAndGoals();
  }, [userId]);

  const fetchStudentAndGoals = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get(`/profile/${userId}`);
      const sid = profileRes.data.id;
      setStudentId(sid);
      const goalsRes = await api.get(`/goals/student/${sid}`);
      setGoals(goalsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/goals', { ...form, userid: userId });
      setShowCreate(false);
      setForm({ goaltitle: '', targetdate: '' });
      fetchStudentAndGoals();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgressUpdate = async (goalId, newProgress) => {
    try {
      await api.put(`/goals/progress/${goalId}`, { progress: newProgress });
      fetchStudentAndGoals();
    } catch (err) {
      console.error('Progress update failed:', err);
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await api.delete(`/goals/${goalId}`);
        fetchStudentAndGoals();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const activeGoals = goals.filter(g => g.status === 'Active');
  const completedGoals = goals.filter(g => g.status === 'Completed');

  return (
    <Layout title="My Goals">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="rounded-2xl border border-white/5 p-5 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-400/10"><Target size={20} className="text-emerald-400" /></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Active Goals</p>
              <p className="text-2xl font-black text-white">{activeGoals.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 p-5 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><CheckCircle size={20} className="text-primary" /></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Completed</p>
              <p className="text-2xl font-black text-white">{completedGoals.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 p-5 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-400/10"><Flame size={20} className="text-orange-400" /></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Best Streak</p>
              <p className="text-2xl font-black text-white">
                {goals.length > 0 ? Math.max(...goals.map(g => g.streak || 0)) : 0} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <Card title="Active Goals" action={
        <button onClick={() => setShowCreate(true)} className="btn-primary"><PlusCircle size={18} /> New Goal</button>
      }>
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading goals...</div>
        ) : activeGoals.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Target size={48} className="mx-auto opacity-20 mb-3" />
            <p>No active goals. Create one to start tracking your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map(goal => (
              <div key={goal.id} className="rounded-xl border border-white/5 p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{goal.goaltitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target: {new Date(goal.targetdate).toLocaleDateString()} •
                      Streak: <span className="text-orange-400 font-bold">{goal.streak || 0} 🔥</span>
                    </p>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(goal.progress || 0, 100)}%`,
                        background: `linear-gradient(90deg, #6366f1, #8b5cf6)`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white min-w-[40px] text-right">{Math.round(goal.progress || 0)}%</span>
                </div>

                {/* Quick Progress Buttons */}
                <div className="flex gap-2 mt-3">
                  {[25, 50, 75, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => handleProgressUpdate(goal.id, val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        (goal.progress || 0) >= val
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card title={`Completed (${completedGoals.length})`}>
          <div className="space-y-3">
            {completedGoals.map(goal => (
              <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10">
                <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{goal.goaltitle}</p>
                  <p className="text-xs text-slate-500">Streak: {goal.streak || 0} days</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Set a New Goal">
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <FormInput label="Goal Title" name="goaltitle" value={form.goaltitle} onChange={e => setForm({ ...form, goaltitle: e.target.value })} required placeholder="e.g. Complete Chapter 5 revision" />
            <FormInput label="Target Date" name="targetdate" type="date" value={form.targetdate} onChange={e => setForm({ ...form, targetdate: e.target.value })} required />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
