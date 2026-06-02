import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    try {
      console.log('Intentando login para:', email, 'en', api.defaults.baseURL);
      set({ isLoading: true });
      const response = await api.post('/auth/login', { email, password });
      console.log('Respuesta del servidor:', response.status);
      
      const { access_token, user } = response.data;

      if (user.role !== 'delivery' && user.role !== 'admin') {
        console.warn('Rol no autorizado:', user.role);
        set({ isLoading: false });
        return false;
      }

      await SecureStore.setItemAsync('userToken', access_token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      set({ user, token: access_token, isLoading: false });
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      if (error.response) {
        console.error('Error del servidor:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No hubo respuesta del servidor (Network Error)');
      } else {
        console.error('Error de configuración:', error.message);
      }
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userData = await SecureStore.getItemAsync('userData');
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
