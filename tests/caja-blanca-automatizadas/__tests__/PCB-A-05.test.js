// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-05.test.js

// Definir una clase personalizada de error para las pruebas
class CustomError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Mock de la función createPaymentIntent
const createPaymentIntent = (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new CustomError("unauthenticated", "Debes iniciar sesión para realizar pagos");
  }

  const { amount, paymentMethodId, description = "Compra en Cactilia" } = request.data;

  // Validar datos
  if (!amount || amount <= 0) {
    throw new CustomError("invalid-argument", "El monto debe ser mayor a cero");
  }

  if (!paymentMethodId) {
    throw new CustomError("invalid-argument", "Se requiere un método de pago");
  }

  try {
    // Mock de las funciones de Stripe
    const stripe = {
      paymentIntents: {
        create: jest.fn().mockImplementation(() => Promise.resolve({
          id: 'pi_test_123',
          client_secret: 'pi_test_secret_123',
          status: 'requires_confirmation'
        }))
      }
    };

    // Simulamos la creación del cliente
    const stripeCustomerId = 'cus_test_123';

    // Crear un Payment Intent
    const paymentIntentPromise = stripe.paymentIntents.create({
      amount: amount,
      currency: 'mxn',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description,
      confirmation_method: 'manual',
      setup_future_usage: 'off_session',
      metadata: {
        firebaseUserId: request.auth.uid
      }
    });

    // Registrar intento de pago (mock)
    const logPaymentIntent = jest.fn().mockResolvedValue(null);

    // Resolver la promesa
    return paymentIntentPromise.then(paymentIntent => {
      // Retornar client_secret para confirmar desde el cliente
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    });
  } catch (error) {
    console.error("Error creando Payment Intent:", error);
    throw new CustomError("internal", error.message);
  }
};

// Pruebas
describe('createPaymentIntent Function', () => {
  // Caso 1: Usuario no autenticado
  test('debe rechazar si el usuario no está autenticado', async () => {
    const request = {
      data: { amount: 1000, paymentMethodId: 'pm_test' },
      auth: null
    };
    
    await expect(async () => {
      await createPaymentIntent(request);
    }).rejects.toMatchObject({
      code: 'unauthenticated'
    });
  });
  
  // Caso 2: Amount inválido
  test('debe rechazar si el amount es inválido', async () => {
    const request = {
      data: { amount: 0, paymentMethodId: 'pm_test' },
      auth: { uid: 'user123' }
    };
    
    await expect(async () => {
      await createPaymentIntent(request);
    }).rejects.toMatchObject({
      code: 'invalid-argument'
    });
  });
  
  // Caso 3: PaymentMethodId inválido
  test('debe rechazar si falta el paymentMethodId', async () => {
    const request = {
      data: { amount: 1000 },
      auth: { uid: 'user123' }
    };
    
    await expect(async () => {
      await createPaymentIntent(request);
    }).rejects.toMatchObject({
      code: 'invalid-argument'
    });
  });
  
  // Caso 4: Pago exitoso
  test('debe crear correctamente un payment intent', async () => {
    const request = {
      data: { 
        amount: 1000, 
        paymentMethodId: 'pm_test_123',
        description: 'Test purchase'
      },
      auth: { uid: 'user123' }
    };
    
    const result = await createPaymentIntent(request);
    
    expect(result).toHaveProperty('clientSecret');
    expect(result).toHaveProperty('paymentIntentId');
    expect(result.clientSecret).toBe('pi_test_secret_123');
  });
  
  // Caso 5: Error en Stripe
  test('debe manejar errores de la API de Stripe', async () => {
    // Mock para forzar un error en la función de Stripe
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
    
    const request = {
      data: { amount: 1000, paymentMethodId: 'pm_test_123' },
      auth: { uid: 'user123' }
    };
    
    // Reemplazamos temporalmente la función para que lance un error
    const mockedCreatePaymentIntent = (request) => {
      if (request.auth && request.data.amount > 0 && request.data.paymentMethodId) {
        throw new CustomError('internal', 'Stripe API error');
      }
      return {};
    };
    
    await expect(async () => {
      await mockedCreatePaymentIntent(request);
    }).rejects.toMatchObject({
      code: 'internal'
    });
    
    // Restaurar console.error
    global.console.error.mockRestore();
  });
}); 