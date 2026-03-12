import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import { LoginSignup } from "./components/LoginSignup/LoginSignup";
import { Dashboard }   from './components/Dashboard/Dashboard';
import { Welcome }     from './components/Welcome/Welcome';
import { Timetable }   from "./components/TimeTable/TimeTable";
import { Student }     from "./components/Student/Student";
import { Staff }       from "./components/Staff/Staff";
import { Report }      from "./components/Report/Report";
import { Tutor }       from "./components/Tutor/Tutor";
import { News }        from "./components/News/News";
import { Classroom }   from "./components/Classroom/Classroom";
import { Chatroom }    from "./components/Chatroom/Chatroom";
import { SubjectTutor } from "./components/SubjectTutor/SubjectTutor";
import { Transaction }  from "./components/Transaction/Transaction";
import { EditStudent }  from "./components/Student/EditStudent";
import { Profile }      from "./components/Profile/Profile";
import { TutorPayment } from "./components/TutorPayment/TutorPayment";
import { EditTutor }    from "./components/Tutor/EditTutor";
import { UserReport }   from "./components/Report/UserReport";
import { Grade }        from "./components/Grade/Grade";
import { RevenueIntelligence } from "./components/Report/RevenueIntelligence";
import { StaffPayment } from "./components/StaffPayment/StaffPayment";

// Student Portal
import { StudentPortal } from "./components/StudentPortal/StudentPortal";
import { StudentNotes }   from "./components/StudentPortal/StudentNotes";
import { FlashcardDeck }  from "./components/StudentPortal/FlashcardDeck";
import { StudentGoals }   from "./components/StudentPortal/StudentGoals";
import { QuizArena }      from "./components/StudentPortal/QuizArena";

// Tutor Portal
import { TutorDashboard } from "./components/TutorDashboard/TutorDashboard";

// Admin/Staff Tools
import { ActivityLog } from "./components/ActivityLog/ActivityLog";
import { AnalyticsDashboard } from "./components/Analytics/AnalyticsDashboard";

// Wrap any page that requires authentication
const Protected = ({ element }) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"      element={<Welcome />} />
        <Route path="/login" element={<LoginSignup />} />

        {/* Protected — requires valid, non-expired JWT in localStorage */}
        <Route path="/dashboard"        element={<Protected element={<Dashboard />} />} />
        <Route path="/timetable"        element={<Protected element={<Timetable />} />} />
        <Route path="/staff"            element={<Protected element={<Staff />} />} />
        <Route path="/tutor"            element={<Protected element={<Tutor />} />} />
        <Route path="/student"          element={<Protected element={<Student />} />} />
        <Route path="/news"             element={<Protected element={<News />} />} />
        <Route path="/report"           element={<Protected element={<Report />} />} />
        <Route path="/classroom"        element={<Protected element={<Classroom />} />} />
        <Route path="/chatroom"         element={<Protected element={<Chatroom />} />} />
        <Route path="/subject-tutor"    element={<Protected element={<SubjectTutor />} />} />
        <Route path="/transaction"      element={<Protected element={<Transaction />} />} />
        <Route path="/edit-student/:id" element={<Protected element={<EditStudent />} />} />
        <Route path="/profile"          element={<Protected element={<Profile />} />} />
        <Route path="/tutor-payment"    element={<Protected element={<TutorPayment />} />} />
        <Route path="/edit-tutor/:id"   element={<Protected element={<EditTutor />} />} />
        <Route path="/user-report"      element={<Protected element={<UserReport />} />} />
        <Route path="/grade"            element={<Protected element={<Grade />} />} />
        <Route path="/revenue"          element={<Protected element={<RevenueIntelligence />} />} />
        <Route path="/staff-payment"    element={<Protected element={<StaffPayment />} />} />

        {/* Student Portal */}
        <Route path="/student-portal"     element={<Protected element={<StudentPortal />} />} />
        <Route path="/student-notes"      element={<Protected element={<StudentNotes />} />} />
        <Route path="/student-flashcards" element={<Protected element={<FlashcardDeck />} />} />
        <Route path="/student-goals"      element={<Protected element={<StudentGoals />} />} />
        <Route path="/student-quiz"       element={<Protected element={<QuizArena />} />} />

        {/* Tutor Portal */}
        <Route path="/tutor-dashboard"    element={<Protected element={<TutorDashboard />} />} />

        {/* Admin/Staff Tools */}
        <Route path="/activity-log"       element={<Protected element={<ActivityLog />} />} />
        <Route path="/analytics"          element={<Protected element={<AnalyticsDashboard />} />} />
      </Routes>
    </Router>
  );
}

export default App;