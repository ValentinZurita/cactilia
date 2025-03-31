import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getStripeConfig } from '../../../config/app/appConfig.js'


/**
 * Hook para cargar la instancia de Stripe
 * Maneja la carga asíncrona y cacheo de la instancia de Stripe
 *
 * @returns {Object} Estado y promesa de Stripe
 */
export const useStripeLoader = () => {
  const [stripePromise, setStripePromise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStripeInstance = async () => {
      try {
        setIsLoading(true);

        // Obtener la configuración de Stripe
        const stripeConfig = getStripeConfig();
        const stripePublicKey = stripeConfig.publicKey;

        if (!stripePublicKey) {
          throw new Error('Clave pública de Stripe no configurada');
        }

        // Cargar instancia de Stripe con las opciones de configuración
        const stripeInstance = await loadStripe(stripePublicKey);
        setStripePromise(stripeInstance);
        setError(null);
      } catch (err) {
        console.error('Error cargando Stripe:', err);
        setError(err.message || 'Error al inicializar el sistema de pagos');
      } finally {
        setIsLoading(false);
      }
    };

    loadStripeInstance();
  }, []);

  return {
    stripePromise,
    isLoading,
    error
  };
};