import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { StudentPortal } from "./components/StudentPortal/StudentPortal";
import { StudentNotes }   from "./components/StudentPortal/StudentNotes";
import { FlashcardDeck }  from "./components/StudentPortal/FlashcardDeck";
import { StudentGoals }   from "./components/StudentPortal/StudentGoals";
import { QuizArena }      from "./components/StudentPortal/QuizArena";
import { TutorDashboard } from "./components/TutorDashboard/TutorDashboard";
import { Welcome }     from './components/Welcome/Welcome';
import { LoginSignup } from "./components/LoginSignup/LoginSignup";
import { Timetable }   from "./components/TimeTable/TimeTable";
import { Classroom }   from "./components/Classroom/Classroom";
import { Student }     from "./components/Student/Student";
import { EditStudent } from "./components/Student/EditStudent";
import { News }        from "./components/News/News";
import { Chatroom }    from "./components/Chatroom/Chatroom";
import { Profile }      from "./components/Profile/Profile";
import { AnalyticsDashboard } from "./components/Analytics/AnalyticsDashboard";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

// Wrap any page that requires authentication
const Protected = ({ element }) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

const DashboardRedirect = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return <Navigate to="/login" replace />;
  try {
    const { user_type } = jwtDecode(token);
    if (user_type === 'STUDENT') return <Navigate to="/student-portal" replace />;
    if (user_type === 'TUTOR') return <Navigate to="/tutor-dashboard" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public */}
        <Route path="/"      element={<Welcome />} />
        <Route path="/login" element={<LoginSignup />} />

        {/* Dashboards */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/student-portal"     element={<Protected element={<StudentPortal />} />} />
        <Route path="/tutor-dashboard"    element={<Protected element={<TutorDashboard />} />} />

        {/* Study Hub */}
        <Route path="/student-notes"      element={<Protected element={<StudentNotes />} />} />
        <Route path="/student-flashcards" element={<Protected element={<FlashcardDeck />} />} />
        <Route path="/student-goals"      element={<Protected element={<StudentGoals />} />} />
        <Route path="/student-quiz"       element={<Protected element={<QuizArena />} />} />
        <Route path="/ai-insight"         element={<Protected element={<AnalyticsDashboard />} />} />

        {/* Shared Protected Tools */}
        <Route path="/timetable"        element={<Protected element={<Timetable />} />} />
        <Route path="/classroom"        element={<Protected element={<Classroom />} />} />
        <Route path="/student"          element={<Protected element={<Student />} />} />
        <Route path="/student/edit/:id" element={<Protected element={<EditStudent />} />} />
        <Route path="/news"             element={<Protected element={<News />} />} />
        <Route path="/chatroom"         element={<Protected element={<Chatroom />} />} />
        <Route path="/profile"          element={<Protected element={<Profile />} />} />

        {/* Catch all */}
        <Route path="*" element={<DashboardRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;