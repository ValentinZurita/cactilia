// Mock para las funciones de Stripe durante desarrollo

/**
 * Simula la creación de un PaymentIntent
 */
export const mockCreatePaymentIntent = async (data) => {
  console.log('📝 [DEV] Creando PaymentIntent simulado:', data);

  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 700));

  // Generar un ID para el PaymentIntent
  const mockId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  // Generar un secret con formato similar al de Stripe
  const mockSecret = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  // Datos simulados que coinciden con la estructura esperada
  return {
    data: {
      clientSecret: `${mockId}_secret_${mockSecret}`,
      paymentIntentId: mockId
    }
  };
};

/**
 * Simula la confirmación de un pago
 */
export const mockConfirmOrderPayment = async (data) => {
  console.log('📝 [DEV] Confirmando pago simulado:', data);

  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    data: {
      success: true,
      orderStatus: 'processing',
      paymentStatus: 'succeeded'
    }
  };
};

/**
 * Determina si se debe usar mocks basándose en la variable de entorno
 */
export const shouldUseMocks = () => {
  // Lee la variable de entorno VITE_USE_STRIPE_MOCKS
  // Si la variable es exactamente la cadena 'true', devuelve true.
  // En cualquier otro caso (undefined, 'false', etc.), devuelve false.
  // console.log('VITE_USE_STRIPE_MOCKS:', import.meta.env.VITE_USE_STRIPE_MOCKS); // Descomenta para depurar
  return import.meta.env.VITE_USE_STRIPE_MOCKS === 'true';
};