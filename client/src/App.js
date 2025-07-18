import React, { useState, useEffect } from "react";
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import { LoginSignup } from "./components/LoginSignup/LoginSignup";
import { Dashboard } from './components/Dashboard/Dashboard';
import { Welcome } from './components/Welcome/Welcome';
import { Timetable } from "./components/TimeTable/TimeTable";
import { Student } from "./components/Student/Student";
import { Staff } from "./components/Staff/Staff";
import { Report } from "./components/Report/Report";
import { Tutor } from "./components/Tutor/Tutor";
import { News } from "./components/News/News";
import { Classroom } from "./components/Classroom/Classroom";
import { Chatroom } from "./components/Chatroom/Chatroom";
import { NewStudent } from "./components/Student/NewStudent";
import { NewTutor } from "./components/Tutor/NewTutor";
import { NewStaff} from "./components/Staff/NewStaff";
import { NewClassroom} from "./components/Classroom/NewClassroom";
import { SubjectTutor} from "./components/SubjectTutor/SubjectTutor";
import { Transaction} from "./components/Transaction/Transaction";
import { EditStudent } from "./components/Student/EditStudent";
import { Profile } from "./components/Profile/Profile";
import { TutorPayment } from "./components/TutorPayment/TutorPayment";
import { EditTutor } from "./components/Tutor/EditTutor";
import { CreateSubjectTutor } from "./components/SubjectTutor/CreateSubjectTutor";


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
    <Route path="/new-student" element={<NewStudent />} />
    <Route path="/new-tutor" element={<NewTutor />} />
    <Route path="/new-staff" element={<NewStaff />} />
    <Route path="/new-classroom" element={<NewClassroom />} />
    <Route path="/subject-tutor" element={<SubjectTutor />} />
    <Route path="/transaction" element={<Transaction />} />
    <Route path="/edit-student/:id" element={<EditStudent />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/tutor-payment" element={<TutorPayment />}/>
    <Route path="/edit-tutor/:id" element={<EditTutor />}/>
    <Route path="/new-subject" element={<CreateSubjectTutor />}/>
    </Routes>
  </Router>
);
}

export default App