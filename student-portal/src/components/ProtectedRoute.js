import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuth = localStorage.getItem("token"); // or use a context
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
