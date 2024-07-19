import React, { useState, useEffect } from "react";
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import { LoginSignup } from "./components/LoginSignup/LoginSignup";
import { Dashboard } from './components/Dashboard/Dashboard';
import { Welcome } from './components/Welcome/Welcome';
import { Timetable } from "./components/Timetable/Timetable";
import { Student } from "./components/Student/Student";
import { Staff } from "./components/Staff/Staff";
import { Report } from "./components/Report/Report";
import { Tutor } from "./components/Tutor/Tutor";
import { News } from "./components/News/News";
import { Classroom } from "./components/Classroom/Classroom";
import { Chatroom } from "./components/Chatroom/Chatroom";


function App() {
return (
  <Router>
    <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/login" element={<LoginSignup />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/timetable" element={<Timetable />} />
    <Route path="/staff" element={<Staff />} />
    <Route path="/tutor" element={<Tutor />} />
    <Route path="/student" element={<Student />} />
    <Route path="/news" element={<News />} />
    <Route path="/report" element={<Report />} />
    <Route path="/classroom" element={<Classroom />} />
    <Route path="/chatroom" element={<Chatroom />} />
    </Routes>
  </Router>
);
}

export default App