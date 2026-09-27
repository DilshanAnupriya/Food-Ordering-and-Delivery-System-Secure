import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from '../../services/auth/auth';
import { useAuth } from '../../services/auth/authContext';
import { ChevronRight, Lock, User, Coffee } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    // Auth_Service's OAuth2LoginFailureHandler sends failed/cancelled Google logins
    // back here as ?oauthError=<code>. Read it during render (not in an effect) so
    // StrictMode's dev remount can't drop the message.
    const [error, setError] = useState(() => {
        const oauthError = new URLSearchParams(window.location.search).get('oauthError');
        if (!oauthError) return '';
        return oauthError === 'access_denied'
            ? 'Google sign-in was cancelled.'
            : "Google sign-in didn't complete. Please try again.";
    });
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Check if user is already logged in and redirect accordingly
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userRole = authService.getUserRole();
            console.log("Initial userRole check:", userRole);

            // Redirect based on user role
            redirectBasedOnRole(userRole);
        }
    }, [navigate]);

    // Drop ?oauthError from the address bar so a refresh doesn't re-show it.
    useEffect(() => {
        if (new URLSearchParams(window.location.search).has('oauthError')) {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // Function to handle redirects based on roles
    const redirectBasedOnRole = (userRole: string | null) => {
        console.log("Redirecting based on role:", userRole);

        if (!userRole) {
            // If no role is detected but we have a token, assign a default role
            const token = localStorage.getItem('token');
            if (token) {
                console.log("No role detected, but token exists. Setting default role: ROLE_USER");
                localStorage.setItem('userRole', 'ROLE_USER');
                navigate('/'); // Navigate to home page as default
                return;
            }
            return; // No token and no role, don't redirect
        }

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
            case 'ROLE_USER':
            default:
                navigate('/'); // Regular users go to home page
                break;
        }
    };

    // Full-page redirect (not an XHR) into Spring Security's OAuth2 authorization
    // endpoint on the gateway; Google redirects back to /oauth2/redirect with a token.
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8082/oauth2/authorization/google';
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.login({
                username: formData.username.trim(),
                password: formData.password
            });

            // Update auth context after successful login
            checkAuthStatus();

            // Get user role and navigate accordingly
            let userRole = authService.getUserRole();
            console.log("User role after login:", userRole); // Debug log

            // If no role is detected, assign a default role
            if (!userRole) {
                console.log("No role detected after login, assigning default role: ROLE_USER");
                localStorage.setItem('userRole', 'ROLE_USER');
                userRole = 'ROLE_USER';
            }

            // Redirect based on user role
            redirectBasedOnRole(userRole);
        } catch (err: any) {
            // Show lockout feedback as toasts (V-AuthWeakness Test 4 fix):
            // - a countdown when the account is locked,
            // - a warning with the number of attempts left otherwise.
            if (err?.status === 423 || err?.minutesRemaining != null) {
                const mins = err?.minutesRemaining ?? '';
                toast.error(`🔒 Account locked. Try again in ${mins} minute(s).`, { autoClose: 6000 });
            } else if (err?.attemptsRemaining != null && err.attemptsRemaining > 0) {
                toast.warn(`Invalid credentials — ${err.attemptsRemaining} attempt(s) remaining before your account is locked.`);
            } else {
                toast.error(err?.message || 'Login failed. Please try again.');
            }
            setError(err?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Rest of component remains the same
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <ToastContainer position="top-right" autoClose={4000} />
            <video
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                autoPlay
                muted
                loop
            >
                <source src="public/assets/Sprinkling Grated Cheese Pasta 4K.mp4" type="video/mp4" />
            </video>
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80 z-10 items-center justify-center">
            <div className="bg-white py-8 px-4  w-120 ml-160 xl:ml-120 mt-25 shadow-xl sm:rounded-xl sm:px-10 transform transition-all duration-500 hover:shadow-2xl">
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center">
                    <div className="bg-orange-500 text-white rounded-full p-4 shadow-lg transform transition-all duration-500 hover:scale-110">
                        <Coffee size={32} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to order your favorite food
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded animate-pulse">
                            <p className="font-medium">Oops!</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className={`flex items-center relative border rounded-lg transition-all duration-300 ${
                                focusedField === 'username' ? 'border-orange-500 ring-1 ring-orange-500 shadow-sm' : 'border-gray-300'
                            }`}>
                                <span className="pl-3 text-gray-400">
                                    <User size={18} />
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-3 py-3 rounded-lg focus:outline-none bg-transparent"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className={`flex items-center relative border rounded-lg transition-all duration-300 ${
                                focusedField === 'password' ? 'border-orange-500 ring-1 ring-orange-500 shadow-sm' : 'border-gray-300'
                            }`}>
                                <span className="pl-3 text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-3 py-3 rounded-lg focus:outline-none bg-transparent"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors duration-300">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-300 transform hover:translate-y-px"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Sign in
                                    <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
                                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 009 18z"/>
                                    <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"/>
                                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/register"
                                className="w-full flex justify-center py-3 px-4 border border-orange-300 rounded-lg shadow-sm text-sm font-medium text-orange-600 bg-transparent hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
                            >
                                Create a new account
                            </Link>
                        </div>
                    </div>

            </div>
            </div>
            </div>
        </div>
    );
};

export default Login;