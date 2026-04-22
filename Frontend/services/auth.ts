import api from './api';
import * as SecureStore from 'expo-secure-store';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
  expiresIn: number; // Added expiresIn to match backend response
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', data);
    await SecureStore.setItemAsync('access_token', response.data.token);
    await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', data);
    await SecureStore.setItemAsync('access_token', response.data.token);
    await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch {
      // Even if the API call fails, clear local data
    } finally {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user');
    }
  },

  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync('access_token');
  },

  async getStoredUser() {
    const userJson = await SecureStore.getItemAsync('user');
    return userJson ? JSON.parse(userJson) : null;
  },
};