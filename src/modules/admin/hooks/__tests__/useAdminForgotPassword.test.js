import { renderHook, act } from '@testing-library/react-hooks';
import { useAdminForgotPassword } from '../useAdminForgotPassword';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getErrorMessage } from '../utils/errorMessages';

// Mock de dependencias externas
jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
  getAuth: jest.fn()
}));

jest.mock('../utils/errorMessages', () => ({
  getErrorMessage: jest.fn()
}));

// Mock de window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  origin: 'https://test.app'
};

describe('useAdminForgotPassword Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendPasswordResetEmail.mockReset();
    getErrorMessage.mockReset();
    
    // Mock por defecto para getErrorMessage
    getErrorMessage.mockImplementation((code) => {
      const errorMap = {
        'auth/user-not-found': 'No existe una cuenta con este email.',
        'auth/invalid-email': 'El formato del correo electrónico es inválido.'
      };
      return errorMap[code] || 'Error desconocido';
    });
  });

  afterAll(() => {
    // Restaurar window.location después de todos los tests
    window.location = originalLocation;
  });

  test('debe iniciar con el estado correcto', () => {
    const { result } = renderHook(() => useAdminForgotPassword());
    
    expect(result.current.state).toEqual({
      loading: false,
      error: null,
      success: false
    });
  });

  test('debe actualizar el estado al enviar un email exitosamente', async () => {
    // Mock que resuelve exitosamente
    sendPasswordResetEmail.mockResolvedValueOnce();
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminForgotPassword());
    
    // Acción: enviar solicitud de recuperación
    act(() => {
      result.current.sendPasswordReset({ email: 'admin@cactilia.com' });
    });
    
    // Verificar estado de carga
    expect(result.current.state.loading).toBe(true);
    
    // Esperar resolución asincrónica
    await waitForNextUpdate();
    
    // Verificar estado final
    expect(result.current.state).toEqual({
      loading: false,
      error: null,
      success: true
    });
    
    // Verificar que se llamó a Firebase con los parámetros correctos
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'admin@cactilia.com',
      {
        url: 'https://test.app/admin/login',
        handleCodeInApp: false
      }
    );
  });

  test('debe manejar errores y usar getErrorMessage para formatear el mensaje', async () => {
    // Mock que rechaza con error
    const errorMock = { code: 'auth/user-not-found' };
    sendPasswordResetEmail.mockRejectedValueOnce(errorMock);
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminForgotPassword());
    
    // Acción: enviar solicitud de recuperación
    act(() => {
      result.current.sendPasswordReset({ email: 'noexiste@cactilia.com' });
    });
    
    // Esperar resolución asincrónica
    await waitForNextUpdate();
    
    // Verificar el manejo del error
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.success).toBe(false);
    expect(result.current.state.error).toBe('No existe una cuenta con este email.');
    
    // Verificar que se llamó a getErrorMessage
    expect(getErrorMessage).toHaveBeenCalledWith('auth/user-not-found');
  });

  test('debe manejar errores de red', async () => {
    // Mock error de red
    const networkError = { code: 'auth/network-request-failed' };
    sendPasswordResetEmail.mockRejectedValueOnce(networkError);
    getErrorMessage.mockReturnValueOnce('Error de conexión. Verifica tu internet.');
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminForgotPassword());
    
    act(() => {
      result.current.sendPasswordReset({ email: 'admin@cactilia.com' });
    });
    
    await waitForNextUpdate();
    
    expect(result.current.state.error).toBe('Error de conexión. Verifica tu internet.');
  });

  test('debe manejar múltiples envíos correctamente (restableciendo estado)', async () => {
    // Primer envío: éxito
    sendPasswordResetEmail.mockResolvedValueOnce();
    
    const { result, waitForNextUpdate } = renderHook(() => useAdminForgotPassword());
    
    // Primer envío
    act(() => {
      result.current.sendPasswordReset({ email: 'admin1@cactilia.com' });
    });
    
    await waitForNextUpdate();
    expect(result.current.state.success).toBe(true);
    
    // Segundo envío: error
    sendPasswordResetEmail.mockRejectedValueOnce({ code: 'auth/invalid-email' });
    
    act(() => {
      result.current.sendPasswordReset({ email: 'email-invalido' });
    });
    
    // Verificar que se reinició el estado
    expect(result.current.state.success).toBe(false);
    expect(result.current.state.loading).toBe(true);
    
    await waitForNextUpdate();
    
    // Verificar estado final con error
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBe('El formato del correo electrónico es inválido.');
  });
}); 