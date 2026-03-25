import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { 
  Target, PlusCircle, Flame, TrendingUp, CheckCircle, Clock, 
  Trash2, ChevronRight, Zap, Shield, Rocket, AlertCircle, Info
} from 'lucide-react';

export const StudentGoals = () => {
  const [userId, setUserId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    goaltitle: '', 
    targetdate: '', 
    subjecttutorid: '',
    chapter: '',
    subtopics: '',
    checklist: []
  });
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // For mobile view toggle
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
      } catch (e) { console.error(e); }
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
      
      const [goalsRes, subjectsRes] = await Promise.all([
        api.get(`/goals/${sid}`),
        api.get(`/students/student-subject/${userId}`)
      ]);
      
      setGoals(goalsRes.data || []);
      setSubjects(subjectsRes.data?.data?.subjects || subjectsRes.data?.subjects || []);
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
      setForm({ goaltitle: '', targetdate: '', subjecttutorid: '', chapter: '', subtopics: '', checklist: [] });
      toast.success('Mission Commenced! Good luck!');
      fetchStudentAndGoals();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to initialize mission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgressUpdate = async (goalId, newProgress) => {
    try {
      await api.put(`/goals/progress/${goalId}`, { progress: newProgress });
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress: newProgress, status: newProgress >= 100 ? 'Completed' : 'Active' } : g));
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(prev => ({ ...prev, progress: newProgress, status: newProgress >= 100 ? 'Completed' : 'Active' }));
      }
      toast.success('Momentum updated');
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const handleToggleCheckItem = async (goalId, itemId) => {
    console.log('TOGGLE:', { goalId, itemId });
    // Optimistic Update
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        console.log('GOAL FOUND, CHECKLIST:', g.checklist);
        const newList = g.checklist.map(i => {
          if (String(i.id) === String(itemId)) {
            console.log('MATCH FOUND! Old completed:', i.completed, 'New:', !i.completed);
            return { ...i, completed: !i.completed };
          }
          return i;
        });
        const completedCount = newList.filter(i => i.completed).length;
        const progress = Math.round((completedCount / newList.length) * 100);
        const status = progress >= 100 ? 'Completed' : 'Active';
        const updatedGoal = { ...g, checklist: newList, progress, status };
        
        if (selectedGoal?.id === goalId) {
          setSelectedGoal(prev => prev && prev.id === goalId ? updatedGoal : prev);
        }
        return updatedGoal;
      }
      return g;
    }));

    try {
      const res = await api.put(`/goals/toggle-item/${goalId}`, { itemId });
      const serverGoal = res.data.goal;
      
      setGoals(prev => prev.map(g => g.id === goalId ? serverGoal : g));
      setSelectedGoal(prev => prev && prev.id === goalId ? serverGoal : prev);
      
      toast.success('Mission updated!', { id: 'mission-sync' });
    } catch (err) {
      toast.error('Failed to sync progress');
      // Rollback would be nice but for now we'll just fetch fresh data
      fetchStudentAndGoals();
    }
  };

  const generateAIItems = async () => {
    if (!form.goaltitle) return toast.error('Enter a Mission Title first');
    setIsSubmitting(true);
    try {
      const res = await api.post('/goals/generate-checklist', { 
        goaltitle: form.goaltitle, 
        userid: userId,
        chapter: form.chapter,
        subtopics: form.subtopics
      });
      setForm(prev => ({ ...prev, checklist: res.data.checklist }));
      toast.success('AI Blueprint generated!');
    } catch (err) {
      toast.error('AI Blueprint failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Abort this mission? All progress will be lost.')) {
      try {
        await api.delete(`/goals/${goalId}`);
        toast.success('Mission aborted');
        fetchStudentAndGoals();
      } catch (err) {
        toast.error('Failed to abort mission');
      }
    }
  };

  // Logic to categorize goals for Kanban
  const commencedGoals = goals.filter(g => g.status === 'Active' && (g.progress || 0) < 30);
  const inProgressGoals = goals.filter(g => g.status === 'Active' && (g.progress || 0) >= 30 && (g.progress || 0) < 100);
  const conqueredGoals = goals.filter(g => g.status === 'Completed' || (g.progress || 0) >= 100);

  const getUrgencyColor = (targetDate) => {
    const hoursAway = (new Date(targetDate) - new Date()) / 36e5;
    if (hoursAway < 24) return 'border-red-500/30 bg-red-500/5 text-red-400 shadow-red-500/10';
    if (hoursAway < 72) return 'border-amber-500/30 bg-amber-500/5 text-amber-400 shadow-amber-500/10';
    return 'border-white/5 bg-white/[0.02] text-primary shadow-primary/5';
  };

  const MissionCard = ({ goal }) => {
    const bgColor = getUrgencyColor(goal.targetdate);
    const isHighUrgency = (new Date(goal.targetdate) - new Date()) / 36e5 < 48;

    return (
      <div 
        onClick={() => setSelectedGoal(goal)}
        className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] group relative overflow-hidden cursor-pointer ${bgColor}`}
      >
        {isHighUrgency && goal.status !== 'Completed' && (
          <div className="absolute top-0 right-0 p-1">
            <Zap size={14} className="text-red-500 animate-pulse fill-red-500" />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {subjects.find(s => s.subject_id === goal.subjecttutorid)?.subject || 'CORE MISSION'}
            </p>
            <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors pr-2">
              {goal.goaltitle}
            </h3>
          </div>
          <button onClick={() => handleDelete(goal.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>

        {/* Circular Progress (Simplified representation) */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
               <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                       strokeDasharray={126} strokeDashoffset={126 - (126 * (goal.progress || 0)) / 100}
                       className="text-primary transition-all duration-1000 ease-out" />
             </svg>
             <span className="absolute text-[10px] font-black text-white">{Math.round(goal.progress || 0)}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <Clock size={12} /> Ends: {new Date(goal.targetdate).toLocaleDateString()}
            </div>
            {goal.streak > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 mt-1">
                <Flame size={12} className="fill-orange-400" /> {goal.streak} Day Momentum
              </div>
            )}
          </div>
        </div>

        {/* Checklist Blueprint */}
        {goal.checklist?.length > 0 && (
          <div className="space-y-2 mb-2">
            {goal.checklist.slice(0, 3).map(item => (
              <div 
                key={item.id} 
                className="flex items-start gap-2 group/task cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCheckItem(goal.id, item.id);
                }}
              >
                <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/5 group-hover/task:border-primary'}`}>
                  {item.completed && <CheckCircle size={10} className="text-white fill-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-[11px] leading-tight transition-all ${item.completed ? 'text-slate-600 line-through' : 'text-slate-300 group-hover/task:text-white'}`}>
                    {item.text}
                  </p>
                  {item.tip && !item.completed && (
                    <div className="flex items-center gap-1 mt-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity">
                      <Zap size={8} className="text-primary" />
                      <span className="text-[8px] text-primary/80 font-medium font-mono uppercase tracking-tighter">Pro Tip Available</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {goal.checklist.length > 3 && (
              <p className="text-[10px] text-slate-600 italic">+{goal.checklist.length - 3} more objectives...</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout title="Mastery Roadmap">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total XP Gained</p>
            <div className="flex items-end gap-2 text-white">
               <span className="text-2xl font-black">1,240</span>
               <TrendingUp size={16} className="text-emerald-400 mb-1.5" />
            </div>
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Missions Commenced</p>
            <div className="flex items-end gap-2 text-white">
               <span className="text-2xl font-black">{goals.length}</span>
               <Rocket size={16} className="text-primary mb-1.5" />
            </div>
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Study Momentum</p>
            <div className="flex items-end gap-2 text-white">
               <span className="text-2xl font-black">{goals.length > 0 ? Math.max(...goals.map(g => g.streak || 0)) : 0}</span>
               <Flame size={16} className="text-orange-400 mb-1.5 fill-orange-400" />
            </div>
         </div>
         <div className="flex items-center justify-end">
            <button onClick={() => setShowCreate(true)} className="btn-primary py-4 px-6 rounded-2xl flex items-center gap-3 group">
               <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
               <span className="font-black text-sm uppercase tracking-widest">New Mission</span>
            </button>
         </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
           <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Syncing Mission Intelligence...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
          {/* Lane 1: Commenced */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-slate-500" />
                   <h2 className="text-xs font-black text-white uppercase tracking-widest">Commenced</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{commencedGoals.length}</span>
             </div>
             <div className="space-y-4 bg-white/[0.01] rounded-3xl p-2 min-h-[400px]">
                {commencedGoals.map(goal => <MissionCard key={goal.id} goal={goal} />)}
                {commencedGoals.length === 0 && (
                   <div className="py-12 text-center opacity-30">
                      <AlertCircle size={32} className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No New Missions</p>
                   </div>
                )}
             </div>
          </div>

          {/* Lane 2: In Progress */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary" />
                   <h2 className="text-xs font-black text-white uppercase tracking-widest text-primary">Executing</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{inProgressGoals.length}</span>
             </div>
             <div className="space-y-4 bg-white/[0.01] rounded-3xl p-2 min-h-[400px]">
                {inProgressGoals.map(goal => <MissionCard key={goal.id} goal={goal} />)}
                {inProgressGoals.length === 0 && (
                   <div className="py-12 text-center opacity-30">
                      <Clock size={32} className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No Missions in Progress</p>
                   </div>
                )}
             </div>
          </div>

          {/* Lane 3: Conquered */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <h2 className="text-xs font-black text-white uppercase tracking-widest text-emerald-500">Conquered</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{conqueredGoals.length}</span>
             </div>
             <div className="space-y-4 bg-white/[0.01] rounded-3xl p-2 min-h-[400px]">
                {conqueredGoals.map(goal => <MissionCard key={goal.id} goal={goal} />)}
                {conqueredGoals.length === 0 && (
                   <div className="py-12 text-center opacity-30">
                      <Shield size={32} className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting First Victory</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Initialize Mission Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Initialize New Mission">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-5">
            <FormInput 
              label="Mission Objective" 
              name="goaltitle" 
              value={form.goaltitle} 
              onChange={e => setForm({ ...form, goaltitle: e.target.value })} 
              required 
              placeholder="e.g. Master Trigonometric Identifies"
              className="!bg-slate-900/60 border-slate-800"
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Chapter/Unit" name="chapter" value={form.chapter} onChange={e => setForm({ ...form, chapter: e.target.value })} required placeholder="e.g. Units 1-4" />
                <FormInput label="Focus Areas" name="subtopics" value={form.subtopics} onChange={e => setForm({ ...form, subtopics: e.target.value })} placeholder="e.g. Proofs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FormSelect 
                label="Domain (Subject)" 
                name="subjecttutorid" 
                value={form.subjecttutorid} 
                onChange={e => setForm({ ...form, subjecttutorid: e.target.value })} 
                options={[
                  { label: 'Select Domain...', value: '' },
                  ...subjects.map(s => ({ label: s.subject, value: String(s.subject_id) }))
                ]}
                required 
              />
              <FormInput 
                label="Deadline" 
                name="targetdate" 
                type="date" 
                value={form.targetdate} 
                onChange={e => setForm({ ...form, targetdate: e.target.value })} 
                required 
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                max={new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]} // 6 months ahead
              />
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 relative group/ai">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mission AI Blueprint</span>
                 </div>
                 <button 
                  type="button" 
                  onClick={generateAIItems}
                  disabled={isSubmitting || !form.goaltitle}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Architecting...' : 'Generate Roadmap'}
                </button>
              </div>

              {form.checklist?.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                   {form.checklist.map((item, idx) => (
                     <div key={idx} className="p-3 rounded-xl bg-black/20 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-black font-mono">{item.category}</span>
                           <p className="text-[11px] font-bold text-white leading-tight">{item.text}</p>
                        </div>
                        <p className="text-[9px] text-slate-500 italic flex items-center gap-1">
                           <Info size={10} className="text-primary/50" /> {item.tip}
                        </p>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-600 border border-dashed border-white/5 rounded-xl">
                   <p className="text-[10px] font-bold uppercase">Awaiting Mission Parameters...</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-4.5 rounded-2xl bg-white/5 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">Abort</button>
            <button 
              type="submit" 
              disabled={isSubmitting || !form.goaltitle || !form.subjecttutorid || !form.targetdate} 
              className="flex-[2] btn-primary rounded-2xl py-4.5 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-40"
            >
              {isSubmitting ? 'Initializing...' : 'Commence Mission'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mission Brief Detail Modal */}
      <Modal 
        isOpen={!!selectedGoal} 
        onClose={() => setSelectedGoal(null)} 
        title={selectedGoal?.goaltitle || 'Mission Brief'}
      >
        {selectedGoal && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-none mb-1.5">Domain</p>
                <p className="text-sm font-bold text-white">{subjects.find(s => s.subject_id === selectedGoal.subjecttutorid)?.subject || 'Core Mission'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-none mb-1.5">Deadline</p>
                <p className="text-sm font-bold text-white">{new Date(selectedGoal.targetdate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Manual Progress Override */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Target size={16} className="text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Momentum</span>
                </div>
                <span className="text-sm font-black text-white">{Math.round(selectedGoal.progress || 0)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedGoal.progress || 0}
                onChange={(e) => handleProgressUpdate(selectedGoal.id, parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[9px] text-slate-600 italic text-center">Drag slider for manual momentum override</p>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-primary" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Mission Blueprint</h3>
               </div>
               
               <div className="space-y-3">
                  {selectedGoal.checklist?.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-2xl border transition-all ${item.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}
                    >
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCheckItem(selectedGoal.id, item.id);
                          }}
                          className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/5 hover:border-primary'}`}
                        >
                          {item.completed && <CheckCircle size={14} className="text-white fill-white" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className={`px-1.5 py-0.5 rounded text-[8px] font-black font-mono ${
                               item.category === 'MASTERY' ? 'bg-emerald-500/20 text-emerald-400' :
                               item.category === 'PRACTICE' ? 'bg-primary/20 text-primary' :
                               'bg-slate-500/20 text-slate-400'
                             }`}>{item.category || 'TASK'}</span>
                             <p className={`text-sm font-bold leading-tight ${item.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{item.text}</p>
                          </div>
                          {item.tip && !item.completed && (
                            <div className="flex items-start gap-2 mt-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                               <Zap size={14} className="text-primary shrink-0 mt-0.5" />
                               <p className="text-[11px] text-primary/80 leading-relaxed font-medium"><span className="font-black uppercase text-[9px] mr-1">Pro Tip:</span>{item.tip}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="pt-4 flex justify-end">
               <button 
                onClick={() => setSelectedGoal(null)}
                className="btn-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest"
               >
                 Dismiss Brief
               </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
