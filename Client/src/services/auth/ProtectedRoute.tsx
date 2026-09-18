import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext.tsx';

// Generic protected route component
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;