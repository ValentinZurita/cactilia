import React, { createContext, useContext, useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Crear una instancia única de Stripe a nivel de aplicación
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Crear el contexto
const StripeContext = createContext({
  stripe: null,
  stripeReady: false
});

export const StripeProvider = ({ children }) => {
  const [stripeReady, setStripeReady] = useState(false);

  // Verificar cuando Stripe esté listo
  useEffect(() => {
    if (stripePromise) {
      stripePromise.then(() => {
        setStripeReady(true);
      }).catch(err => {
        console.error("Error inicializando Stripe:", err);
        setStripeReady(false);
      });
    }
  }, []);

  // Opciones para el componente Elements
  const stripeElementsOptions = {
    locale: 'es',
    appearance: {
      theme: 'stripe'
    }
  };

  return (
    <StripeContext.Provider value={{ stripeReady }}>
      <Elements stripe={stripePromise} options={stripeElementsOptions}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};

// Hook personalizado para facilitar el uso del contexto
export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe debe ser usado dentro de un StripeProvider');
  }
  return context;
};