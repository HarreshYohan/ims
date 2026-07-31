import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
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
import { SubjectTutor } from './components/SubjectTutor/SubjectTutor';
import { ClassScheduleApprovals } from './components/ClassScheduleApprovals/ClassScheduleApprovals';
import { Transaction }  from "./components/Transaction/Transaction";
import { EditStudent }  from "./components/Student/EditStudent";
import { Profile }      from "./components/Profile/Profile";
import { TutorPayment } from "./components/TutorPayment/TutorPayment";
import { EditTutor }    from "./components/Tutor/EditTutor";
import { UserReport }   from "./components/Report/UserReport";
import { Grade }        from "./components/Grade/Grade";
import { RevenueIntelligence } from "./components/Report/RevenueIntelligence";
import { StaffPayment } from "./components/StaffPayment/StaffPayment";
import { Syllabus } from "./components/Syllabus/Syllabus";



import { ActivityLog } from "./components/ActivityLog/ActivityLog";
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
    if (user_type === 'ADMIN' || user_type === 'STAFF') return <Navigate to="/dashboard" replace />;
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
        <Route path="/schedule-approvals" element={<Protected element={<ClassScheduleApprovals />} />} />
        <Route path="/syllabus"         element={<Protected element={<Syllabus />} />} />

        {/* Admin/Staff Tools */}
        <Route path="/activity-log"       element={<Protected element={<ActivityLog />} />} />
        <Route path="/analytics"          element={<Protected element={<AnalyticsDashboard />} />} />

        {/* Catch all */}
        <Route path="*" element={<DashboardRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;