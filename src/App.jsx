// src/App.jsx
import '../src/styles/global.css';
import '../src/styles/scrollbar.css';
import { AppRouter } from './routes/AppRouter';
import { useCheckAuth } from './shared/hooks/useCheckAuth.js';
import { Spinner } from './shared/components/spinner/Spinner.jsx';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StripeProvider } from './contexts/StripeContext.jsx';
import { loadCartFromFirestore, mergeCartsOnLogin } from './modules/shop/features/cart/store/index.js'

export const App = () => {
  // Check if user is authenticated
  const status = useCheckAuth();

  // Get dispatch function from Redux
  const dispatch = useDispatch();

  // Get user authentication status
  const auth = useSelector(state => state.auth);

  // Effect to load cart when user logs in
  useEffect(() => {
    // Si el usuario está autenticado, cargar su carrito desde Firestore
    if (status === 'authenticated' && auth.uid) {
      // Cargar directamente el carrito del usuario desde Firestore
      // Sin fusionar para evitar duplicaciones
      dispatch(loadCartFromFirestore());
    }
  }, [status, auth.uid, dispatch]);

  // Show spinner while checking authentication status
  if (status === 'checking') {
    // Show spinner
    return <Spinner />;
  }

  return (
    <StripeProvider>
      <AppRouter />
    </StripeProvider>
  );
};