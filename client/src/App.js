import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LoginSignup } from "./components/LoginSignup/LoginSignup";
import { Dashboard } from './components/Dashboard/Dashboard';
import { Welcome } from './components/Welcome/Welcome';
<<<<<<< Updated upstream
=======
import { TimeTable } from "./components/TimeTable/TimeTable";
import { Student } from "./components/Student/Student";
import { Staff } from "./components/Staff/Staff";
import { Report } from "./components/Report/Report";
import { Tutor } from "./components/Tutor/Tutor";
import { News } from "./components/News/News";
import { Profile } from "./components/Profile/Profile";
>>>>>>> Stashed changes
import './App.css'


function App() {
return (
  <Router>
    <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/login" element={<LoginSignup />} />
    <Route path="/dashboard" element={<Dashboard />} />
<<<<<<< Updated upstream
=======
    <Route path="/timetable" element={<TimeTable />} />
    <Route path="/staff" element={<Staff />} />
    <Route path="/student" element={<Student />} />
    <Route path="/news" element={<News />} />
    <Route path="/report" element={<Report />} />
    <Route path="/tutor" element={<Tutor />} />
    <Route path="/profile" element={<Profile />} />
>>>>>>> Stashed changes
    </Routes>
  </Router>
);
}

export default App