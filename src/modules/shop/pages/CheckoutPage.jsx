// src/modules/shop/pages/CheckoutPage.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { CheckoutProvider } from '../context/CheckoutContext';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../features/cart/hooks/useCart';
import { useStripeLoader } from '../hooks/useStripeLoader';
import { CheckoutContent } from '../features/checkout/components/CheckoutContent';

// Estilos
import '../features/checkout/styles/checkout.css';

/**
 * Página principal de checkout
 *
 * Esta página actúa como contenedor para el proceso de checkout:
 * - Verifica la autenticación
 * - Carga el proveedor de Stripe
 * - Verifica si hay ítems en el carrito
 * - Provee los contextos necesarios para el checkout
 *
 * @returns {JSX.Element} Página de checkout o redirección según el estado
 */
export const CheckoutPage = () => {
  // Verificar autenticación
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Si está cargando la autenticación, mostrar mensaje de carga
  if (isAuthLoading) {
    return <CheckoutLoadingState message="Verificando sesión..." />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login?redirect=checkout" replace />;
  }

  return <AuthenticatedCheckout />;
};

/**
 * Componente para usuarios autenticados
 * Maneja la carga de Stripe y verificación del carrito
 */
const AuthenticatedCheckout = () => {
  const { items: cartItems, isLoading: isCartLoading } = useCart();
  const { stripePromise, isLoading: isStripeLoading } = useStripeLoader();

  // Si está cargando el carrito, mostrar mensaje de carga
  if (isCartLoading) {
    return <CheckoutLoadingState message="Cargando carrito..." />;
  }

  // Verificar si el carrito está vacío
  if (!cartItems || cartItems.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  // Si está cargando Stripe, mostrar mensaje de carga
  if (isStripeLoading) {
    return <CheckoutLoadingState message="Inicializando sistema de pagos..." />;
  }

  // Todo listo, renderizar el contenido del checkout con los proveedores necesarios
  return (
    <Elements stripe={stripePromise}>
      <CheckoutProvider>
        <CheckoutContent />
      </CheckoutProvider>
    </Elements>
  );
};

/**
 * Componente para estados de carga
 */
const CheckoutLoadingState = ({ message = "Cargando..." }) => (
  <div className="container my-5 text-center">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
    <p className="mt-3">{message}</p>
  </div>
);