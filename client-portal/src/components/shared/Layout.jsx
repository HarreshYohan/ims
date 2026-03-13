import React from 'react';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';

/**
 * Standard Layout Wrapper
 * @param {Object} props
 * @param {string} props.title - Title for the SectionHeader
 * @param {React.ReactNode} props.children - Main content
 * @param {string} props.maxWidth - Tailwind max-width class (default: max-w-7xl)
 */
export const Layout = ({ title, children, maxWidth = 'max-w-7xl' }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header type="dashboard" action="Logout" />
      <Navbar />
      
      {/* Container that respects the sidebar width */}
      <div className="lg:pl-64 flex-1 flex flex-col">
          {/* Section Header */}
          <SectionHeader section={title} />
          
          {/* Main content area */}
          <main className={`flex-1 p-6 lg:p-10 ${maxWidth} mx-auto w-full space-y-8 animate-in fade-in duration-500 overflow-hidden`}>
            {children}
          </main>
      </div>
    </div>
  );
};
