import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../index';
import { useAuthStore } from '../../store/authStore';
import { Alert } from 'react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('lucide-react-native', () => ({
  Dog: 'Dog',
}));

jest.mock('../../store/authStore', () => {
  const actual = jest.requireActual('../../store/authStore');
  return {
    ...actual,
    useAuthStore: jest.fn(),
  };
});

describe('LoginScreen Integration Test', () => {
  let mockLogin: jest.Mock;
  let mockCheckAuth: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin = jest.fn();
    mockCheckAuth = jest.fn();

    // Mock Zustand hook output, supporting calls with or without selector function
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        login: mockLogin,
        isLoading: false,
        checkAuth: mockCheckAuth,
        user: null,
      };
      return selector ? selector(state) : state;
    });

    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('debe renderizar el formulario de login correctamente', async () => {
    const { getByPlaceholderText, getByText } = await render(<LoginScreen />);

    expect(getByText('¡Hola, Rider!')).toBeTruthy();
    expect(getByPlaceholderText('tu@email.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getByText('Comenzar Turno')).toBeTruthy();
  });

  it('debe llamar a checkAuth al montar el componente', async () => {
    await render(<LoginScreen />);
    expect(mockCheckAuth).toHaveBeenCalled();
  });

  it('debe mostrar alerta si los campos están vacíos al presionar login', async () => {
    const { getByText } = await render(<LoginScreen />);
    const loginButton = getByText('Comenzar Turno');

    await fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Por favor ingresa email y contraseña');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('debe llamar a login con los valores ingresados al presionar el botón', async () => {
    mockLogin.mockResolvedValueOnce(true);
    const { getByPlaceholderText, getByText } = await render(<LoginScreen />);

    const emailInput = getByPlaceholderText('tu@email.com');
    const passwordInput = getByPlaceholderText('••••••••');
    const loginButton = getByText('Comenzar Turno');

    await fireEvent.changeText(emailInput, 'rider@example.com');
    await fireEvent.changeText(passwordInput, 'secreto123');
    await fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('rider@example.com', 'secreto123');
    });
  });

  it('debe mostrar alerta si las credenciales son inválidas', async () => {
    mockLogin.mockResolvedValueOnce(false);
    const { getByPlaceholderText, getByText } = await render(<LoginScreen />);

    const emailInput = getByPlaceholderText('tu@email.com');
    const passwordInput = getByPlaceholderText('••••••••');
    const loginButton = getByText('Comenzar Turno');

    await fireEvent.changeText(emailInput, 'rider@invalid.com');
    await fireEvent.changeText(passwordInput, 'incorrecto');
    await fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Credenciales inválidas o no tienes permiso de repartidor'
      );
    });
  });

  it('debe redirigir a available si hay un usuario logueado', async () => {
    // Simular que el usuario ya está autenticado
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        login: mockLogin,
        isLoading: false,
        checkAuth: mockCheckAuth,
        user: { id: 1, name: 'John Doe', role: 'delivery' },
      };
      return selector ? selector(state) : state;
    });

    await render(<LoginScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/available');
    });
  });
});
