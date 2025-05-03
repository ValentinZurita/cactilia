// --- Estilos Globales ---
import '../src/styles/global.css';
import '../src/styles/scrollbar.css';

// --- React y Redux ---
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// --- Hooks Personalizados ---
import { useCheckAuth } from './shared/hooks/useCheckAuth.js';
import { useSiteMetadata } from './shared/hooks/useSiteMetadata.js'; 

// --- Componentes Compartidos ---
import { Spinner } from './shared/components/spinner/Spinner.jsx';

// --- Contextos ---
// import { StripeProvider } from './contexts/StripeContext.jsx'; // REMOVED

// --- Lógica del Store (Redux) ---
import { loadCartFromFirestore } from './modules/shop/features/cart/store/index.js'; // Asumiendo que mergeCartsOnLogin ya no se usa directamente aquí
import { fetchCompanyInfo, fetchSocialLinks, selectSiteConfigStatus } from './store/slices/siteConfigSlice.js';

// --- Router Principal ---
import { AppRouter } from './routes/AppRouter';

// Quitar imports que causan error o no se usan aquí
// import { HelmetProvider } from 'react-helmet-async'
// import { useAuth } from './modules/auth/hooks/useAuth.js' 
// import { useSiteConfig } from './modules/public/hooks/useSiteConfig.js'
// import { fetchInitialSiteConfig } from './store/slices/siteConfigSlice.js'


/**
 * @component App
 * @description Componente raíz de la aplicación.
 * Responsabilidades principales:
 * - Aplicar estilos globales.
 * - Verificar el estado de autenticación del usuario.
 * - Inicializar metadatos globales del sitio (título, favicon, etc.) usando `useSiteMetadata`.
 * - Cargar el carrito del usuario desde Firestore al iniciar sesión.
 * - Proveer el contexto de Stripe.
 * - Renderizar el enrutador principal (`AppRouter`).
 * - Mostrar un spinner mientras se verifica la autenticación.
 */
export const App = () => {

  // --- Hooks de Estado y Autenticación ---
  const status = useCheckAuth(); // Verifica el estado de autenticación al cargar
  const auth = useSelector(state => state.auth); // Obtiene estado de autenticación de Redux
  const dispatch = useDispatch(); // Obtiene la función dispatch de Redux
  const siteConfigStatus = useSelector(selectSiteConfigStatus);

  // --- Hook para Metadatos Globales ---
  // Inicializa/actualiza <title>, favicon, <meta description>, JSON-LD, etc.
  useSiteMetadata(); 

  // --- Efecto para Cargar Carrito del Usuario ---
  useEffect(() => {
    // Si el usuario está autenticado y tenemos su UID, cargar su carrito
    if (status === 'authenticated' && auth.uid) {
      // Despacha la acción para cargar el carrito desde Firestore
      // Nota: La lógica de fusión de carritos (si existe) debería estar dentro del store/thunk.
      dispatch(loadCartFromFirestore());
    }
    // Dependencias: se ejecuta cuando cambia el estado de autenticación o el UID
  }, [status, auth.uid, dispatch]);

  // --- Efecto para Cargar Configuración del Sitio ---
  useEffect(() => {
    // Cargar la configuración del sitio solo si no se ha cargado ya
    if (siteConfigStatus === 'idle') {
      console.log('Dispatching initial site config fetch...');
      dispatch(fetchCompanyInfo());
      dispatch(fetchSocialLinks());
    }
    // Dependencia: solo se ejecuta si el estado de carga cambia a 'idle'
  }, [siteConfigStatus, dispatch]);

  // --- Renderizado Condicional: Spinner de Carga ---
  // Muestra un spinner mientras se determina el estado de autenticación
  if (status === 'checking') {
    return <Spinner />;
  }

  // --- Renderizado Principal ---
  return (
    <AppRouter />
  );
};