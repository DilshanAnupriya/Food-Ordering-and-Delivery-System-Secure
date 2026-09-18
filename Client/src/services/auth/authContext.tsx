import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  logout: (callback?: () => void) => void;
  checkAuthStatus: () => void;
  getToken: () => string | null;
  getUserRole: () => string | null;
}

interface DecodedToken {
  sub: string; // usually email
  userId?: string; // check if this exists
  role?: string;
  authorities?: Array<{authority: string}>;
  exp?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        // Check token expiration
        if (decoded.exp) {
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Token expired, logout
            logout();
            return;
          }
        }

        setIsAuthenticated(true);
        setUser(decoded);

        // Save userId separately
        if (decoded && decoded.userId) {
          localStorage.setItem('userId', decoded.userId);
        } else if (decoded && decoded.sub) {
          localStorage.setItem('userId', decoded.sub); // fallback to email
        }

        // Handle role based on both direct role property and authorities array
        if (decoded && decoded.role) {
          localStorage.setItem('userRole', decoded.role);
        } else if (decoded && decoded.authorities && Array.isArray(decoded.authorities)) {
          // Check for different roles in order of priority
          const roles = [
            'ROLE_ADMIN',
            'ROLE_RESTAURANT_OWNER',
            'ROLE_DELIVERY',
            'ROLE_USER'
          ];

          for (const roleToCheck of roles) {
            const hasRole = decoded.authorities.some(
                (auth: {authority: string}) => auth.authority === roleToCheck
            );

            if (hasRole) {
              localStorage.setItem('userRole', roleToCheck);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
    }
  };

  const getUserRole = () => {
    // First check localStorage for cached role
    const cachedRole = localStorage.getItem('userRole');
    if (cachedRole) return cachedRole;

    // If not in localStorage, check the token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        // Check if role is directly available
        if (decoded.role) {
          return decoded.role;
        }

        // Check authorities array if available
        if (decoded.authorities && Array.isArray(decoded.authorities)) {
          // Check for different roles in order of priority
          const roles = [
            'ROLE_ADMIN',
            'ROLE_RESTAURANT_OWNER',
            'ROLE_DELIVERY',
            'ROLE_USER'
          ];

          for (const roleToCheck of roles) {
            const hasRole = decoded.authorities.some(
                (auth: {authority: string}) => auth.authority === roleToCheck
            );

            if (hasRole) {
              return roleToCheck;
            }
          }
        }
      } catch {
        return null;
      }
    }
    return null;
  };

  const logout = (callback?: () => void) => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("restaurantId");
    sessionStorage.removeItem("orderDetails");
    sessionStorage.removeItem("orderDetail");
    sessionStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    setUser(null);

    if (callback) {
      callback();
    }
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
      <AuthContext.Provider value={{
        isAuthenticated,
        user,
        logout,
        checkAuthStatus,
        getToken,
        getUserRole
      }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}