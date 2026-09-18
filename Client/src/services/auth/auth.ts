import { jwtDecode } from 'jwt-decode';
import axios from "axios";

interface LoginCredentials {
    username: string;
    password: string;
}
interface RegisterData {
    username: string;
    password: string;
    fullName: string;
}

interface DecodedToken {
    sub: string;
    userId?: string;
    role?: string;
    authorities?: Array<{authority: string}>;
    exp?: number;
}

interface AuthResponse {
    token: string;
    user: any;
}

const API_URL = 'http://localhost:8082/';

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Make API request using Axios - trying multiple possible endpoints
            let response;
            try {
                // First attempt: API_URL/auth/login (common pattern)
                response = await axios.post(`${API_URL}login`, credentials, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*',
                        'Access-Control-Expose-Headers': 'Authorization'
                    }
                });
            } catch (err) {
                // Second attempt: directly at /login (as in original code)
                response = await axios.post(`http://localhost:8082/login`, credentials, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*',
                        'Access-Control-Expose-Headers': 'Authorization'
                    }
                });
            }

            // Check if token is in the response header (common JWT pattern)
            let token = response.headers['authorization'];

            // If not in header, check response data
            if (!token && response.data && response.data.token) {
                token = response.data.token;
            }

            // If still no token found, check if it's in the format "Bearer <token>"
            if (!token && response.headers['authorization']) {
                const authHeader = response.headers['authorization'];
                if (authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (!token) {
                throw new Error('No authentication token found in response');
            }

            // Store token in localStorage
            localStorage.setItem('token', token);

            // Decode token to get user information
            const decodedToken = jwtDecode<any>(token);
            console.log("Decoded token:", decodedToken); // Debug

            // Process and store roles
            if (decodedToken.authorities && Array.isArray(decodedToken.authorities) && decodedToken.authorities.length > 0) {
                // Define role priority
                const rolePriority = [
                    'ROLE_ADMIN',
                    'ROLE_RESTAURANT_OWNER',
                    'ROLE_DELIVERY',
                    'ROLE_USER'
                ];

                // Check for roles in order of priority
                for (const roleToCheck of rolePriority) {
                    const hasRole = decodedToken.authorities.some(
                        (auth: {authority: string}) => auth.authority === roleToCheck
                    );

                    if (hasRole) {
                        localStorage.setItem('userRole', roleToCheck);
                        break;
                    }
                }
            } else if (decodedToken.role) {
                localStorage.setItem('userRole', decodedToken.role);
            } else {
                // When no explicit role is found in the token,
                // assign a role based on other token properties or default to USER

                // Check for additional role indicators
                if (decodedToken.isAdmin === true) {
                    localStorage.setItem('userRole', 'ROLE_ADMIN');
                } else if (decodedToken.restaurantOwner === true || decodedToken.isRestaurantOwner === true) {
                    localStorage.setItem('userRole', 'ROLE_RESTAURANT_OWNER');
                } else if (decodedToken.delivery === true || decodedToken.isDelivery === true) {
                    localStorage.setItem('userRole', 'ROLE_DELIVERY');
                } else if (decodedToken.userId) {
                    // If we have a userId but no role info, default to regular user
                    localStorage.setItem('userRole', 'ROLE_USER');
                }
            }

            // If still no role assigned, check response data for role info
            if (!localStorage.getItem('userRole') && response.data) {
                if (response.data.role) {
                    localStorage.setItem('userRole', response.data.role);
                } else if (response.data.userRole) {
                    localStorage.setItem('userRole', response.data.userRole);
                } else if (response.data.user && response.data.user.role) {
                    localStorage.setItem('userRole', response.data.user.role);
                }
            }

            return {
                token: token,
                user: decodedToken
            };
        } catch (error) {
            console.error('Login error:', error);

            // Better error handling for different scenarios
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with a status other than 2xx
                    const errorMessage = error.response.data?.message || 'Login failed';
                    throw new Error(errorMessage);
                } else if (error.request) {
                    // Request was made but no response received
                    throw new Error('No response from server. Please check your connection.');
                }
            }

            // For any other errors
            throw new Error('Login failed. Please try again.');
        }
    }

    // New register method
    async register(registerData: RegisterData): Promise<void> {
        try {
            // Create the request payload as expected by the backend
            const requestUserDto = {
                username: registerData.username,
                password: registerData.password,
                fullName: registerData.fullName
            };

            // Make API request to the register endpoint
            await axios.post(
                `${API_URL}api/v1/users/visitor/register`,
                requestUserDto,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    }
                }
            );

            // No need to return anything as the backend returns 201 Created with no essential data
            // The Register component will navigate to login after successful registration
        } catch (error) {
            console.error('Registration error:', error);

            // Better error handling for different scenarios
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with a status other than 2xx
                    const errorMessage = error.response.data?.message || 'Registration failed';
                    throw new Error(errorMessage);
                } else if (error.request) {
                    // Request was made but no response received
                    throw new Error('No response from server. Please check your connection.');
                }
            }

            // For any other errors
            throw new Error('Registration failed. Please try again.');
        }
    }


    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("restaurantId");
        sessionStorage.removeItem("orderDetails");
        sessionStorage.removeItem("orderDetail");
        sessionStorage.removeItem("isAuthenticated");
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);

            // Check if token is expired
            if (decodedToken.exp) {
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp < currentTime) {
                    this.logout();
                    return false;
                }
            }

            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    getUserRole(): string | null {
        // First check localStorage for cached role
        const cachedRole = localStorage.getItem('userRole');
        if (cachedRole) return cachedRole;

        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const decodedToken = jwtDecode<any>(token);

            // Check if role is in the standard 'role' field
            if (decodedToken.role) {
                // Save to localStorage for future reference
                localStorage.setItem('userRole', decodedToken.role);
                return decodedToken.role;
            }

            // Check if authorities array exists and is not empty
            if (decodedToken.authorities && Array.isArray(decodedToken.authorities) && decodedToken.authorities.length > 0) {
                // Define role priority
                const rolePriority = [
                    'ROLE_ADMIN',
                    'ROLE_RESTAURANT_OWNER',
                    'ROLE_DELIVERY_PERSON',
                    'ROLE_USER'
                ];

                // Check for roles in order of priority
                for (const roleToCheck of rolePriority) {
                    const hasRole = decodedToken.authorities.some(
                        (auth: {authority: string}) => auth.authority === roleToCheck
                    );

                    if (hasRole) {
                        localStorage.setItem('userRole', roleToCheck);
                        return roleToCheck;
                    }
                }
            }

            console.log("No explicit role found in token:", decodedToken);

            // Check for any role indicators in the token
            if (decodedToken.isAdmin === true) {
                localStorage.setItem('userRole', 'ROLE_ADMIN');
                return 'ROLE_ADMIN';
            }

            if (decodedToken.restaurantOwner === true || decodedToken.isRestaurantOwner === true) {
                localStorage.setItem('userRole', 'ROLE_RESTAURANT_OWNER');
                return 'ROLE_RESTAURANT_OWNER';
            }

            if (decodedToken.delivery === true || decodedToken.isDelivery === true) {
                localStorage.setItem('userRole', 'ROLE_DELIVERY_PERSON');
                return 'ROLE_DELIVERY';
            }

            // Special handling for user identifier patterns
            if (decodedToken.userId) {
                // If we have a userId but no role, set a default role of user
                localStorage.setItem('userRole', 'ROLE_USER');
                return 'ROLE_USER';
            }

            return null;
        } catch (error) {
            console.error("Error getting user role:", error);
            return null;
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}

export const authService = new AuthService();