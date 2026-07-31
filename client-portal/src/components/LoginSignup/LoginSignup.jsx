import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import logo_icon from '../../assets/IMS.png';
import hero_img from '../../assets/portal_login_hero.png';

export const LoginSignup = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const data = response.data;
      const userRole = data.user.user_type;

      if (userRole !== 'STUDENT' && userRole !== 'TUTOR') {
        setMessage({ type: 'error', text: 'Access denied. This portal is for Students and Tutors only.' });
        localStorage.removeItem('authToken');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', userRole);
      
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
      
    } catch (err) {
      console.error('Login failed:', err);
      let errorMsg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      
      if (err.message === 'Network Error' && !err.response) {
        errorMsg = 'Network Error. Please check your internet connection and ensure your ad-blocker is disabled for this site.';
      }
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      setMessage({ type: 'success', text: response.data.message || 'Password reset email sent!' });
      setTimeout(() => {
        setIsForgotPassword(false);
        setMessage(null);
        setResetEmail('');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to request password reset.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center lg:p-0">
      <div className="w-full h-full flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Side: Hero Section */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0a0a0c] items-center justify-center p-20 border-r border-white/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] -ml-64 -mb-64" />
          
          <div className="relative z-10 w-full max-w-lg space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-left duration-700">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Premium Learning Experience</span>
              </div>
              <h1 className="text-6xl font-black text-white leading-tight animate-in fade-in slide-in-from-left duration-700 delay-100">
                Unlock Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Potential</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed animate-in fade-in slide-in-from-left duration-700 delay-200">
                A specialized gateway for Students and Tutors to manage schedules, notes, and AI-powered insights.
              </p>
            </div>

            <div className="relative rounded-3xl overflow-hidden glass-card border-white/10 group animate-in zoom-in duration-1000 delay-300">
              <img src={hero_img} alt="Learning Illustration" className="w-full h-auto scale-105 group-hover:scale-110 transition-transform duration-[2000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="flex items-center gap-6 animate-in fade-in duration-1000 delay-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0a0a0c] flex items-center justify-center text-[10px] text-white">
                    U{i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">Joined by 2,000+ students this semester</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 relative overflow-hidden bg-[#0a0a0c]">
          <div className="lg:hidden absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_10%,rgba(139,92,246,0.1),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(20,184,166,0.1),transparent_40%)]" />
          
          <div className="w-full max-w-[440px] relative z-10">
            {/* Branding Mobile */}
            <div className="lg:hidden flex flex-col items-center mb-12">
               <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                 <img src={logo_icon} alt="Logo" className="w-10 h-auto" />
               </div>
               <h2 className="text-3xl font-black text-white">IMS Portal</h2>
            </div>
            
            <div className="hidden lg:block mb-12">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white mb-6">
                 <img src={logo_icon} alt="Logo" className="h-6 w-auto" />
                 <span className="font-bold tracking-tight">IMS.</span>
              </div>
              <h2 className="text-4xl font-black text-white">
                {isForgotPassword ? 'Reset Password' : 'Sign In'}
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                {isForgotPassword ? 'Enter your email to receive a new password' : 'Access your personalized learning portal'}
              </p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Hub</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Enter school email" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all font-medium"
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-6">
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full btn-primary !rounded-2xl py-4.5 flex items-center justify-center gap-3 shadow-xl transition-all"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="font-bold uppercase tracking-widest text-sm">Send Reset Email</span>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(false); setMessage(null); }}
                    disabled={isLoading} 
                    className="w-full bg-white/5 hover:bg-white/10 text-white rounded-2xl py-3 flex items-center justify-center transition-all text-sm font-bold uppercase tracking-widest border border-white/10"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Hub</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Enter school email" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all font-medium"
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Access Key</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(true); setMessage(null); }}
                    className="text-xs font-bold text-primary hover:text-white transition-colors"
                  >
                    Forgot Key?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all font-medium"
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-16 bg-primary hover:bg-primaryHover text-white font-black rounded-2xl transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-sm">Initialize Access</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                {/* Subtle shine effect */}
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />
              </button>
            </form>
            )}

            {/* Error/Success Messages */}
            {message && (
              <div className={`mt-8 p-5 rounded-2xl border flex items-center justify-center animate-in fade-in zoom-in duration-300 ${
                message.type === 'success' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-danger/10 border-danger/20 text-danger'
              }`}>
                <p className="text-sm font-bold tracking-tight italic">{message.text}</p>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
               <p className="text-xs text-slate-600 font-medium tracking-wide">
                 ENCRYPTED SESSION SECURE 
               </p>
               <div className="flex items-center gap-2 text-slate-500">
                  <GraduationCap size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Learning First Platform</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};