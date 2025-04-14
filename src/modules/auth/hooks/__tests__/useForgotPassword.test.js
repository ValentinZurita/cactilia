import { renderHook, act } from '@testing-library/react-hooks';
import { useForgotPassword } from '../useForgotPassword';
import { sendPasswordResetEmail } from 'firebase/auth';

// Mock de Firebase Auth
jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
  getAuth: jest.fn()
}));

describe('useForgotPassword Hook', () => {
  // Antes de cada prueba, reiniciamos los mocks
  beforeEach(() => {
    jest.clearAllMocks();
    sendPasswordResetEmail.mockReset();
    
    // Valores de window.location.origin para pruebas
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://cactilia.com'
      },
      writable: true
    });
  });

  test('debe iniciar con estado inicial correcto', () => {
    const { result } = renderHook(() => useForgotPassword());
    
    expect(result.current.state).toEqual({
      loading: false,
      error: null,
      success: false
    });
  });

  test('debe manejar el envío exitoso de email de recuperación', async () => {
    // Mock de Firebase que resuelve exitosamente
    sendPasswordResetEmail.mockResolvedValueOnce();
    
    const { result, waitForNextUpdate } = renderHook(() => useForgotPassword());
    
    // Acción: ejecutar sendPasswordReset
    act(() => {
      result.current.sendPasswordReset({ email: 'test@example.com' });
    });
    
    // Verificar estado de carga
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.error).toBe(null);
    
    // Esperar la resolución asincrónica
    await waitForNextUpdate();
    
    // Verificar estado final
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
        url: 'https://cactilia.com/auth/login',
        handleCodeInApp: false
      }
    );
  });

  test('debe manejar errores cuando falla el envío de email', async () => {
    // Mock de Firebase que rechaza con error
    const errorMock = { code: 'auth/user-not-found' };
    sendPasswordResetEmail.mockRejectedValueOnce(errorMock);
    
    const { result, waitForNextUpdate } = renderHook(() => useForgotPassword());
    
    // Acción: ejecutar sendPasswordReset
    act(() => {
      result.current.sendPasswordReset({ email: 'noexiste@example.com' });
    });
    
    // Esperar la resolución asincrónica
    await waitForNextUpdate();
    
    // Verificar estado final con error
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.success).toBe(false);
    expect(result.current.state.error).toBe('No existe una cuenta con este email.');
  });

  test('debe manejar errores desconocidos correctamente', async () => {
    // Mock de Firebase que rechaza con error desconocido
    const errorMock = { code: 'auth/unknown-error' };
    sendPasswordResetEmail.mockRejectedValueOnce(errorMock);
    
    const { result, waitForNextUpdate } = renderHook(() => useForgotPassword());
    
    // Acción: ejecutar sendPasswordReset
    act(() => {
      result.current.sendPasswordReset({ email: 'test@example.com' });
    });
    
    // Esperar la resolución asincrónica
    await waitForNextUpdate();
    
    // Verificar que se usa el mensaje genérico para errores desconocidos
    expect(result.current.state.error).toBe('Ocurrió un error al enviar el email. Inténtalo de nuevo.');
  });
}); 