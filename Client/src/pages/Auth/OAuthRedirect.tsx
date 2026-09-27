import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/auth';
import { useAuth } from '../../services/auth/authContext';

// Landing page for Google's OAuth2/OIDC redirect (see
// application.oauth2.frontendRedirectUri in Auth_Service). The gateway/Auth_Service
// issues the same kind of JWT the password login path issues and appends it here
// as ?token=... ; this page just stores it and routes the user like a normal login.
const OAuthRedirect = () => {
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            navigate('/login?oauthError=missing_token', { replace: true });
            return;
        }

        const decodedToken = authService.storeTokenAndResolveRole(token);
        checkAuthStatus();

        const userRole = decodedToken.authorities?.length
            ? localStorage.getItem('userRole')
            : 'ROLE_USER';

        switch (userRole) {
            case 'ROLE_ADMIN':
                navigate('/admin-dashboard');
                break;
            case 'ROLE_RESTAURANT_OWNER':
                navigate('/owner-restaurant');
                break;
            case 'ROLE_DELIVERY_PERSON':
                navigate('/driver-dashboard');
                break;
            default:
                navigate('/');
        }
    }, [navigate, checkAuthStatus]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-700 text-xl">Signing you in…</p>
            </div>
        </div>
    );
};

export default OAuthRedirect;
