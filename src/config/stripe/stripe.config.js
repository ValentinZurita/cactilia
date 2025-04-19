// Configuración de Stripe
import { loadStripe } from '@stripe/stripe-js';

// Determinar el entorno (development o production)
const isDevEnv = import.meta.env.MODE === 'development';

// Obtener la clave pública de Stripe del archivo .env
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Inicializar Stripe
let stripePromise = null;

// Función para obtener la instancia de Stripe (singleton)
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
    
    if (isDevEnv) {
      console.log('💳 Utilizando Stripe en modo desarrollo');
    }
  }
  return stripePromise;
};

// Configuración para las solicitudes a la API de Stripe
export const stripeOptions = {
  // Opciones para el formulario de pago de Stripe
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4a6741', // Color principal de Cactilia
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Raleway, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  },
};

// Opciones específicas para cada método de pago
export const paymentMethodOptions = {
  card: {
    iconStyle: 'solid',
    style: {
      base: {
        iconColor: '#4a6741',
        color: '#30313d',
        fontWeight: '500',
        fontFamily: 'Raleway, system-ui, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        iconColor: '#df1b41',
        color: '#df1b41',
      },
    },
  },
  oxxo: {
    // Opciones específicas para OXXO si es necesario
  },
};