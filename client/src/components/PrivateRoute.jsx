import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const { authToken, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return authToken ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;