import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthResponse } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
  try {
    const storedAuth = await loadAuthData();

    if (storedAuth) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
    }
  } catch (error) {
    console.log('Error loading auth:', error);
  } finally {
    setIsLoading(false);
  }
}



  async function saveAuthData(user: User, token: string, expiresIn: number) {
    const expirationTime = Date.now() + 5 * 60 * 60 * 1000; // Convert seconds to milliseconds
    await AsyncStorage.setItem('access_token', token);
await AsyncStorage.setItem(
  'authData',
  JSON.stringify({ user, expirationTime })
);

  }

 async function loadAuthData() {
  const authData = await AsyncStorage.getItem('authData');
  const token = await AsyncStorage.getItem('access_token');

  if (!authData || !token) return null;

  const { user, expirationTime } = JSON.parse(authData);

  // ⏱️ Only check local expiration
  if (Date.now() > expirationTime) {
    await AsyncStorage.multiRemove(['authData', 'access_token']);
    return null;
  }

  return { user, token };
}



  async function clearAuthData() {
    await AsyncStorage.removeItem('authData');
  }

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.token && response.user && response.expiresIn) {
    await saveAuthData(response.user, response.token, response.expiresIn);
    setUser(response.user);
    setToken(response.token);
    } else {await saveAuthData(response.user, response.token, 60 * 60 * 5);
    setUser(response.user);
  }
  }, []);
  

  const register = useCallback(async (name: string, email: string, password: string, password_confirmation: string) => {
    const response = await authService.register({ name, email, password, password_confirmation });
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await clearAuthData();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}