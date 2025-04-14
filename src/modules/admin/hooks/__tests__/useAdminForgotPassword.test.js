import { renderHook, act } from '@testing-library/react-hooks';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAdminForgotPassword } from '../useAdminForgotPassword';
import { getErrorMessage } from '../utils/errorMessages';
import { jest } from '@jest/globals';

// Jest configurará estos mocks a través de moduleNameMapper
// en jest.config.mjs, así que no necesitamos mockearlos aquí

describe('useAdminForgotPassword', () => {
  // Mock de window.location
  const originalLocation = window.location;
  
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    
    // Configurar window.location.origin
    delete window.location;
    window.location = {
      origin: 'https://test.app'
    };
  });
  
  afterAll(() => {
    // Restaurar window.location después de todos los tests
    window.location = originalLocation;
  });

  test('devuelve el estado inicial correcto', () => {
    const { result } = renderHook(() => useAdminForgotPassword());
    
    // Verificar estado inicial
    expect(result.current.state).toEqual({
      loading: false,
      error: null,
      success: false
    });
    
    // Verificar que la función está definida
    expect(typeof result.current.sendPasswordReset).toBe('function');
  });

  test('gestiona correctamente el envío de email exitoso', async () => {
    // Configurar mock para simular éxito
    sendPasswordResetEmail.mockResolvedValueOnce();
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminForgotPassword());
    
    // Ejecutar la función con un email de prueba
    act(() => {
      result.current.sendPasswordReset({ email: 'test@example.com' });
    });
    
    // Verificar estado de carga
    expect(result.current.state.loading).toBe(true);
    
    // Esperar actualización asíncrona
    await waitForNextUpdate();
    
    // Verificar estado final tras éxito
    expect(result.current.state).toEqual({
      loading: false,
      error: null,
      success: true
    });
    
    // Verificar que se llamó a Firebase con los parámetros correctos
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(), // FirebaseAuth
      'test@example.com',
      {
        url: 'https://test.app/admin/login',
        handleCodeInApp: false
      }
    );
  });

  test('gestiona correctamente los errores', async () => {
    // Configurar mock para simular error
    const mockError = { code: 'auth/user-not-found' };
    sendPasswordResetEmail.mockRejectedValueOnce(mockError);
    getErrorMessage.mockReturnValueOnce('Usuario no encontrado');
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminForgotPassword());
    
    // Ejecutar la función con un email de prueba
    act(() => {
      result.current.sendPasswordReset({ email: 'wrong@example.com' });
    });
    
    // Verificar estado de carga
    expect(result.current.state.loading).toBe(true);
    
    // Esperar actualización asíncrona
    await waitForNextUpdate();
    
    // Verificar estado final tras error
    expect(result.current.state).toEqual({
      loading: false,
      error: 'Usuario no encontrado',
      success: false
    });
    
    // Verificar que se llamó a getErrorMessage con el código correcto
    expect(getErrorMessage).toHaveBeenCalledWith('auth/user-not-found');
  });
}); 