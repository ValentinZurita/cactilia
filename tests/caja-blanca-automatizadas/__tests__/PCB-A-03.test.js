// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-03.test.js

// Mock del módulo authThunks
const startEmailSignIn = (email, password) => {
  return async (dispatch) => {
    dispatch(checkingCredentials());

    try {
      // 1) Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(FirebaseAuth, email, password);
      const { uid, displayName, photoURL, email: userEmail } = userCredential.user;
      const user = userCredential.user;

      // 2) If email is not verified, send email verification
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        
        // 2.1) Sign out in Firebase Auth
        await FirebaseAuth.signOut();

        // 2.2) Sign out in Redux
        dispatch(logout({ errorMessage: "Debes verificar tu correo. Te enviamos un nuevo enlace." }));

        // 2.3) Return error message
        return { ok: false, errorMessage: "Debes verificar tu correo. Te enviamos un nuevo enlace." };
      }

      // 3) If email is verified, dispatch login
      dispatch(login({ uid, email: userEmail, displayName, photoURL }));

      // 4) Return ok: true
      return { ok: true };

    } catch (error) {
      console.error("Error en el inicio de sesión:", error.message);

      // Dispatch logout
      dispatch(logout({ errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde." }));

      // Return error message
      return { ok: false, errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde." };
    }
  };
};

// Mocks para las funciones y módulos necesarios
const checkingCredentials = jest.fn();
const login = jest.fn();
const logout = jest.fn();
const signInWithEmailAndPassword = jest.fn();
const sendEmailVerification = jest.fn();
const FirebaseAuth = {
  signOut: jest.fn()
};

// Mock del dispatch de Redux
const mockDispatch = jest.fn();

describe('Verificación de Email', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  // Caso 1: Login exitoso con email verificado
  test('debe completar el inicio de sesión cuando el email está verificado', async () => {
    // Arrange - Configuración del mock para simular usuario con email verificado
    const mockUser = {
      uid: 'user123',
      displayName: 'Usuario Test',
      email: 'usuario.verificado@example.com',
      photoURL: 'https://example.com/photo.jpg',
      emailVerified: true
    };
    
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    
    // Act - Ejecutar la función a probar
    const result = await startEmailSignIn(
      'usuario.verificado@example.com', 
      'Password123'
    )(mockDispatch);
    
    // Assert - Verificar resultados
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      FirebaseAuth, 
      'usuario.verificado@example.com', 
      'Password123'
    );
    
    expect(sendEmailVerification).not.toHaveBeenCalled();
    expect(FirebaseAuth.signOut).not.toHaveBeenCalled();
    
    expect(mockDispatch).toHaveBeenCalledWith(checkingCredentials());
    expect(mockDispatch).toHaveBeenCalledWith(login({
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      photoURL: mockUser.photoURL
    }));
    
    expect(result).toEqual({ ok: true });
  });

  // Caso 2: Email no verificado
  test('debe enviar email de verificación cuando el email no está verificado', async () => {
    // Arrange - Configuración del mock para simular usuario con email no verificado
    const mockUser = {
      uid: 'user456',
      displayName: 'Usuario Sin Verificar',
      email: 'usuario.sinverificar@example.com',
      photoURL: 'https://example.com/photo.jpg',
      emailVerified: false
    };
    
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    sendEmailVerification.mockResolvedValue();
    
    // Act - Ejecutar la función a probar
    const result = await startEmailSignIn(
      'usuario.sinverificar@example.com', 
      'Password123'
    )(mockDispatch);
    
    // Assert - Verificar resultados
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      FirebaseAuth, 
      'usuario.sinverificar@example.com', 
      'Password123'
    );
    
    expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
    expect(FirebaseAuth.signOut).toHaveBeenCalled();
    
    expect(mockDispatch).toHaveBeenCalledWith(checkingCredentials());
    expect(mockDispatch).toHaveBeenCalledWith(logout({
      errorMessage: "Debes verificar tu correo. Te enviamos un nuevo enlace."
    }));
    
    expect(result).toEqual({ 
      ok: false, 
      errorMessage: "Debes verificar tu correo. Te enviamos un nuevo enlace." 
    });
  });

  // Caso 3: Credenciales incorrectas
  test('debe manejar el error cuando las credenciales son incorrectas', async () => {
    // Arrange - Configuración del mock para simular error de autenticación
    const authError = new Error('auth/wrong-password');
    authError.code = 'auth/wrong-password';
    signInWithEmailAndPassword.mockRejectedValue(authError);
    
    // Act - Ejecutar la función a probar
    const result = await startEmailSignIn(
      'usuario.inexistente@example.com', 
      'PasswordIncorrecta'
    )(mockDispatch);
    
    // Assert - Verificar resultados
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      FirebaseAuth, 
      'usuario.inexistente@example.com', 
      'PasswordIncorrecta'
    );
    
    expect(sendEmailVerification).not.toHaveBeenCalled();
    expect(FirebaseAuth.signOut).not.toHaveBeenCalled();
    
    expect(mockDispatch).toHaveBeenCalledWith(checkingCredentials());
    expect(mockDispatch).toHaveBeenCalledWith(logout({
      errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde."
    }));
    
    expect(result).toEqual({ 
      ok: false, 
      errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde." 
    });
  });

  // Caso 4: Error de conexión
  test('debe manejar errores de red', async () => {
    // Arrange - Configuración del mock para simular error de red
    const networkError = new Error('Network Error');
    networkError.code = 'auth/network-request-failed';
    signInWithEmailAndPassword.mockRejectedValue(networkError);
    
    // Act - Ejecutar la función a probar
    const result = await startEmailSignIn(
      'usuario.normal@example.com', 
      'Password123'
    )(mockDispatch);
    
    // Assert - Verificar resultados
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      FirebaseAuth, 
      'usuario.normal@example.com', 
      'Password123'
    );
    
    expect(mockDispatch).toHaveBeenCalledWith(checkingCredentials());
    expect(mockDispatch).toHaveBeenCalledWith(logout({
      errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde."
    }));
    
    expect(result).toEqual({ 
      ok: false, 
      errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde." 
    });
  });
}); 