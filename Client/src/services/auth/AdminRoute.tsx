import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../services/auth/auth';

interface DecodedToken {
    sub: string;
    userId?: string;
    role?: string;
    exp?: number;
}

const AdminRoute = () => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode<DecodedToken>(token);

                // Check if token is expired
                if (decoded.exp) {
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        // Clear expired token
                        authService.logout();
                        setIsAdmin(false);
                        setLoading(false);
                        return;
                    }
                }

                // Check if user has Admin role - check both formats and authorities
                const userRole = decoded.role;

                // First check direct role property
                let isAdminUser = userRole === 'Admin' || userRole === 'ROLE_ADMIN';

                // If not found, check authorities array if it exists
                if (!isAdminUser && decoded.authorities && Array.isArray(decoded.authorities)) {
                    isAdminUser = decoded.authorities.some(
                        (auth: {authority: string}) => auth.authority === 'ROLE_ADMIN'
                    );
                }

                setIsAdmin(isAdminUser);
                setLoading(false);
            } catch (error) {
                console.error("Error decoding token:", error);
                setIsAdmin(false);
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-orange-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    return isAdmin ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminRoute;