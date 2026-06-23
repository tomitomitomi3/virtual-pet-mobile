import { useAuthStore } from '../authStore';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

// In-memory mock for SecureStore
let mockStorage: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => mockStorage[key] || null),
  setItemAsync: jest.fn(async (key, value) => {
    mockStorage[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key) => {
    delete mockStorage[key];
  }),
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    defaults: {
      baseURL: 'http://localhost:8000',
    },
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    mockStorage = {};
    jest.clearAllMocks();
    // Reset Zustand store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: true,
    });
  });

  it('debe tener un estado inicial correcto', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('checkAuth debe recuperar datos si existen en SecureStore', async () => {
    mockStorage['userToken'] = 'mock-jwt-token';
    mockStorage['userData'] = JSON.stringify({
      id: 1,
      nombre: 'John',
      apellido: 'Doe',
      email: 'john@example.com',
      role: 'delivery',
    });

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.token).toBe('mock-jwt-token');
    expect(state.user).toEqual({
      id: 1,
      nombre: 'John',
      apellido: 'Doe',
      email: 'john@example.com',
      role: 'delivery',
    });
    expect(state.isLoading).toBe(false);
  });

  it('checkAuth debe poner isLoading en false si no hay credenciales', async () => {
    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('login exitoso para rol delivery debe guardar credenciales y actualizar estado', async () => {
    const mockUser = {
      id: 2,
      nombre: 'Rider',
      apellido: 'One',
      email: 'rider@example.com',
      role: 'delivery',
    };
    (api.post as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        access_token: 'valid-token',
        user: mockUser,
      },
    });

    const success = await useAuthStore.getState().login('rider@example.com', 'password123');

    expect(success).toBe(true);
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'rider@example.com',
      password: 'password123',
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', 'valid-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userData', JSON.stringify(mockUser));

    const state = useAuthStore.getState();
    expect(state.token).toBe('valid-token');
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });

  it('login debe fallar si el rol no es delivery ni admin', async () => {
    const mockCustomer = {
      id: 3,
      nombre: 'Cliente',
      apellido: 'Regular',
      email: 'customer@example.com',
      role: 'customer',
    };
    (api.post as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        access_token: 'customer-token',
        user: mockCustomer,
      },
    });

    const success = await useAuthStore.getState().login('customer@example.com', 'password123');

    expect(success).toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('logout debe vaciar SecureStore y resetear el estado', async () => {
    useAuthStore.setState({
      token: 'some-token',
      user: { id: 1, nombre: 'John', apellido: 'Doe', email: 'a@b.com', role: 'delivery' },
    });

    await useAuthStore.getState().logout();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userData');

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
