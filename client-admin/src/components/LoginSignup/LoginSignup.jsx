import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Message } from '../Message/Message.jsx';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import logo_icon from '../../assets/IMS.png';

export const LoginSignup = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleClose = () => {
    setMessage(null);
  };

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

      if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
        setMessage({ type: 'error', text: 'Access denied. This portal is for Administrators and Staff only.' });
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
      const errorMsg = err.response?.data?.message || 'Invalid credentials. Please try again.';
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center gap-2 text-textMuted hover:text-slate-200 transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Login Card */}
        <div className="glass-card p-8 md:p-10 border-white/10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-4 shadow-xl">
              <img src={logo_icon} alt="Logo" className="w-10 h-auto" />
            </div>
            <h2 className="text-3xl font-bold text-slate-200 tracking-tight">
              {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
            </h2>
            <p className="text-textMuted mt-2">
              {isForgotPassword ? 'Enter your email to receive a new password' : 'Sign in to manage your institution'}
            </p>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all overflow-hidden"
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
                  className="w-full btn-primary !rounded-xl py-4 flex items-center justify-center gap-3 shadow-xl transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="font-bold uppercase tracking-wider text-sm">Send Reset Email</span>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(false); setMessage(null); }}
                  disabled={isLoading} 
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-3 flex items-center justify-center transition-all text-sm font-medium"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all overflow-hidden"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-500">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(true); setMessage(null); }}
                  className="text-xs font-semibold text-primary hover:text-primaryHover transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full btn-primary !rounded-xl py-4 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 mt-4 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span className="font-bold uppercase tracking-wider text-sm">Sign In</span>
                </>
              )}
            </button>
          </form>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.type === 'success' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              <div className="flex-1 text-sm font-medium leading-relaxed italic text-center">
                {message.text}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-textMuted text-xs mt-8 tracking-widest uppercase">
          Institute Management System v2.0
        </p>
      </div>
    </div>
  );
};