import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    userId?: string;
    role?: string;
    exp?: number;
}

// Component to check auth status and redirect based on role
const RoleRouter = () => {
    const [loading, setLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState('/login');

    useEffect(() => {
        const checkAuthAndRole = () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setRedirectPath('/login');
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode<DecodedToken>(token);

                // Check if token is expired
                if (decoded.exp) {
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        // Token expired
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('userRole');
                        setRedirectPath('/login');
                        setLoading(false);
                        return;
                    }
                }

                // Check role and set redirect path
                if (decoded.role === 'ROLE_ADMIN') {
                    setRedirectPath('/admin/dashboard');
                } else {
                    setRedirectPath('/');
                }

                setLoading(false);
            } catch (error) {
                console.error("Error decoding token:", error);
                setRedirectPath('/login');
                setLoading(false);
            }
        };

        checkAuthAndRole();
    }, []);

    if (loading) {
        // You could return a loading spinner here
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>;
    }

    return <Navigate to={redirectPath} replace />;
};

export default RoleRouter;