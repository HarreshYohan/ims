import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './Topbar';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
