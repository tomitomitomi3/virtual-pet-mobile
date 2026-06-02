import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Si usas el emulador de Android: http://10.0.2.2:8000
// Si usas el emulador de iOS: http://localhost:8000
// Si usas un celular físico: USA TU IP LOCAL (ej: http://192.168.1.50:8000)
const BASE_URL = Platform.select({
  android: 'http://192.168.0.203:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos máximo
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a cada petición
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
