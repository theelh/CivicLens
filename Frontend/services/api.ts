import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://your-WIFI-IP:8000/api'; // Updated for iOS simulator, replace your-WIFI-IP by your wifi ip adresse to connecte expo application with your project
// Use 'http://10.0.2.2:8000/api' for Android emulator

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  // console.log("TOKEN:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
      // You can trigger a global logout event here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
