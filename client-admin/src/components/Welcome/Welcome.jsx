import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../assets/home-bg.jpg';

export const Welcome = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden relative">
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay scale-110"
        style={{ backgroundImage: `url(${Image})` }}
      />
      
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/50 border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <span className="text-slate-200 font-bold text-xl italic">I</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-200 tracking-widest uppercase italic">ADMIN SYSTEM</h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <a 
              href="http://localhost:3001" 
              className="text-xs font-bold text-slate-200/40 hover:text-primary transition-colors uppercase tracking-[0.2em] border border-white/5 px-4 py-2 rounded-lg bg-white/[0.02]"
            >
              Go to Student Portal →
            </a>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Why Us', 'About Us', 'Contact Us'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                className="text-sm font-medium text-textMuted hover:text-slate-200 transition-colors uppercase tracking-widest py-2"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={handleLogin}
              className="bg-primary hover:bg-primaryHover text-white px-8 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Log In
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-6">
              Modern Education Management
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-200 leading-tight mb-8">
              Pioneering the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-secondary">Future of Learning</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-textMuted mb-12 leading-relaxed">
              Empower your educational institution with our cutting-edge Management System. 
              Efficiency meets Elegance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleLogin} className="btn-primary px-10 py-4 !rounded-full shadow-2xl">
                Get Started Now
              </button>
              <button onClick={() => scrollToSection('why-us')} className="px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-slate-200 font-bold">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="max-w-5xl mx-auto px-6 pb-40 space-y-32">
          
          <div id="why-us" className="glass-card p-12 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            <h2 className="text-3xl font-bold text-slate-200 mb-8 flex items-center gap-4">
              <span className="w-10 h-1 bg-primary rounded-full" /> Why Choose Us
            </h2>
            <p className="text-lg text-textMuted leading-relaxed">
              We are committed to providing an unparalleled learning experience tailored to meet the diverse needs of our students. 
              <br/><br/>
              Our team of highly qualified and experienced educators brings a passion for teaching and a deep understanding of their subjects, 
              ensuring that each student receives the best guidance and support. We offer a personalized approach to learning, 
              with small class sizes and customized lesson plans designed to help students achieve their academic goals and build confidence in their abilities.
            </p>
          </div>

          <div id="about-us" className="glass-card p-12 relative overflow-hidden group">
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors" />
            <h2 className="text-3xl font-bold text-slate-200 mb-8 flex items-center gap-4">
              <span className="w-10 h-1 bg-secondary rounded-full" /> About Our Mission
            </h2>
            <p className="text-lg text-textMuted leading-relaxed font-light italic">
              "We believe in the power of education to transform lives, and we are committed to supporting our students every step of the way."
            </p>
            <p className="mt-8 text-lg text-textMuted leading-relaxed">
              We are dedicated to fostering a learning environment that empowers students to achieve their full potential. 
              Our mission is to provide high-quality, personalized education tailored to each student's unique needs and learning style. 
              With a team of passionate and experienced educators, we offer a comprehensive curriculum designed to build confidence, 
              encourage critical thinking, and enhance academic performance.
            </p>
          </div>

          <div id="contact-us" className="glass-card p-12">
            <h2 className="text-3xl font-bold text-slate-200 mb-12 text-center">Get In Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-slate-200 font-bold">Our Location</h3>
                <p className="text-sm text-textMuted leading-relaxed">
                  IMS Tuition Center<br/>
                  123 Learning Lane<br/>
                  Education City, Country
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-slate-200 font-bold">Call Us</h3>
                <p className="text-sm text-textMuted leading-relaxed">
                  Phone: +1 (555) 123-4567<br/>
                  Fax: +1 (555) 987-6543
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-slate-200 font-bold">Hours</h3>
                <p className="text-sm text-textMuted">
                  Mon - Fri: 9AM - 6PM<br/>
                  Sat: 10AM - 4PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-textMuted text-sm">
          <p>© 2026 Institute Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
