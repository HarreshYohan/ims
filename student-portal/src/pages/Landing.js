import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="landing">
      <h1>Welcome to Student Portal</h1>
      <Link to="/login">Login to Continue</Link>
    </div>
  );
}

export default Landing;
