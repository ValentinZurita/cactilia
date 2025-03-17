// mockFirebaseFunctions.js
import { getFirestore, doc, setDoc, collection, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';

/**
 * Simulación de función Cloud para crear un Setup Intent
 * Para pruebas en desarrollo local sin necesidad de backend
 */
export const mockCreateSetupIntent = async () => {
  // En desarrollo, simulamos un client_secret válido
  const mockClientSecret = `seti_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`;
  const mockSetupIntentId = `seti_mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  console.log('📝 [DEV] Setup Intent simulado creado:', {
    clientSecret: mockClientSecret,
    setupIntentId: mockSetupIntentId
  });

  // Retornamos datos simulados en formato compatible con httpsCallable
  return {
    data: {
      clientSecret: mockClientSecret,
      setupIntentId: mockSetupIntentId
    }
  };
};

/**
 * Simulación de función Cloud para guardar un método de pago
 * Para pruebas en desarrollo local sin necesidad de backend
 */
export const mockSavePaymentMethod = async (userId, paymentData) => {
  try {
    if (!userId) {
      throw new Error('Se requiere el ID de usuario');
    }

    // Simulamos un método de pago con datos básicos
    const mockPaymentMethod = {
      id: `pm_mock_${Date.now()}`,
      userId,
      type: 'visa',
      cardNumber: '•••• •••• •••• 4242',
      expiryDate: '12/25',
      stripePaymentMethodId: paymentData.paymentMethodId || `pm_mock_${Date.now()}`,
      isDefault: paymentData.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Guardamos en Firestore
    const paymentMethodsRef = collection(FirebaseDB, 'payment_methods');
    const docRef = await addDoc(paymentMethodsRef, mockPaymentMethod);

    console.log('📝 [DEV] Método de pago simulado guardado:', docRef.id);

    // Retornamos datos simulados en formato compatible con httpsCallable
    return {
      data: {
        id: docRef.id,
        ...mockPaymentMethod
      }
    };
  } catch (error) {
    console.error('❌ [DEV] Error guardando método de pago simulado:', error);

    // Retornamos error en formato compatible con httpsCallable
    return {
      error: error.message
    };
  }
};

/**
 * Simulación de función Cloud para eliminar un método de pago
 * Para pruebas en desarrollo local sin necesidad de backend
 */
export const mockDetachPaymentMethod = async (paymentMethodId) => {
  console.log('📝 [DEV] Método de pago simulado eliminado:', paymentMethodId);

  // Retornamos datos simulados en formato compatible con httpsCallable
  return {
    data: {
      success: true
    }
  };
};

/**
 * Hook para sobrescribir temporalmente las funciones de Firebase
 * Solo para desarrollo y pruebas
 */
export const useFirebaseFunctionsMock = () => {
  // En un entorno de producción, esta función no haría nada
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Sobrescribe httpsCallable para devolver nuestras implementaciones simuladas
  const originalHttpsCallable = window.firebase?.functions?.httpsCallable;

  window.firebase = window.firebase || {};
  window.firebase.functions = window.firebase.functions || {};
  window.firebase.functions.httpsCallable = (name) => {
    return (data) => {
      console.log(`📝 [DEV] Llamando a función simulada: ${name}`, data);

      switch (name) {
        case 'createSetupIntent':
          return mockCreateSetupIntent();
        case 'savePaymentMethod':
          return mockSavePaymentMethod(data.userId, data);
        case 'detachPaymentMethod':
          return mockDetachPaymentMethod(data.paymentMethodId);
        default:
          console.warn(`⚠️ [DEV] Función no implementada: ${name}`);
          return Promise.resolve({ data: null });
      }
    };
  };

  // Devuelve una función para restaurar la implementación original
  return () => {
    if (originalHttpsCallable) {
      window.firebase.functions.httpsCallable = originalHttpsCallable;
    }
  };
};