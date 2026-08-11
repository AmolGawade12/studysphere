import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (details: any) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const syncAuth = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  useEffect(() => {
    syncAuth();
    
    // Listen to changes in auth tokens/user across tabs or within this window
    window.addEventListener('auth-change', syncAuth);
    return () => {
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  const login = async (credentials: any) => {
    const loggedUser = await authService.login(credentials);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (details: any) => {
    const registeredUser = await authService.register(details);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      setUser(null);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const updated = await authService.updateProfile(profileData);
      setUser((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          profile: updated
        };
      });
      return updated;
    } catch (err) {
      console.error("Failed to update profile", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
export default AuthContext;
