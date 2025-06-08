import { useState, useEffect } from 'react';
import { getCurrentUser, logout, type User } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await checkAuth();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout,
    refreshAuth,
  };
} 