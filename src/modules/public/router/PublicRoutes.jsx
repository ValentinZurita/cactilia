import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// --- Importaciones Estáticas --- 
// Componentes de Layout y Autenticación que se cargan siempre.
import { PublicLayout } from '../../../layout/PublicLayout.jsx';
import { RequireAuth } from '../../auth/components/RequireAuth.jsx'; // Componente para proteger rutas
import { ProfileLayout } from '../../user/components/profile/index.js'; // Layout específico para el perfil
import { PublicLayoutSkeleton } from "../../../layout/PublicLayoutSkeleton.jsx"; // Skeleton para el layout público

// --- Carga Diferida (Lazy Loading) de Componentes --- 
// Estas páginas/componentes se cargarán solo cuando sean necesarios.

// Páginas públicas y de la tienda
const HomePageLazy = lazy(() => import("../pages/HomePage.jsx"));
const ShopPageLazy = lazy(() => import("../../shop/pages/ShopPage.jsx"));
const CartPageLazy = lazy(() => import("../../shop/pages/CartPage.jsx"));
const ContactPageLazy = lazy(() => import("../pages/ContactPage.jsx"));
const AuthRoutesLazy = lazy(() => import("../../auth/router/AuthRoutes.jsx")); // Rutas de autenticación

// Páginas del perfil de usuario
const OverviewPageLazy = lazy(() => import('../../user/pages/OverviewPage'));
const OrdersPageLazy = lazy(() => import('../../user/pages/OrdersPage'));
const AddressesPageLazy = lazy(() => import('../../user/pages/AddressesPage'));
const PaymentsPageLazy = lazy(() => import('../../user/pages/PaymentsPage'));
const SettingsPageLazy = lazy(() => import('../../user/pages/SettingsPage'));

/**
 * Componente que define las rutas principales accesibles bajo el PublicLayout.
 * Incluye rutas públicas, de tienda, autenticación y el perfil de usuario protegido.
 * Utiliza Lazy Loading para optimizar la carga inicial.
 */
export const PublicRoutes = () => {
  return (
    // Suspense envuelve las rutas para manejar la carga diferida
    // Usa PublicLayoutSkeleton como fallback visual durante la carga de la ruta
    <Suspense fallback={<PublicLayoutSkeleton />}>
      <Routes>
        {/* Ruta base que aplica el Layout Público a todas las rutas anidadas */}
        <Route element={<PublicLayout />}>
          
          {/* --- Rutas Públicas (Sin Protección) --- */}
          <Route path="/" element={<HomePageLazy />} />
          <Route path="/shop" element={<ShopPageLazy />} />
          <Route path="/cart" element={<CartPageLazy />} />
          <Route path="/contacto" element={<ContactPageLazy />} />
          
          {/* Ruta que delega al enrutador de Autenticación */}
          <Route path="/auth/*" element={<AuthRoutesLazy />} />

          {/* --- Rutas Protegidas del Perfil de Usuario --- */}
          {/* RequireAuth asegura que solo usuarios autenticados accedan */}
          {/* ProfileLayout aplica el diseño específico del perfil */}
          <Route path="/profile" element={<RequireAuth><ProfileLayout /></RequireAuth>}>
            
            {/* Sub-rutas dentro del perfil de usuario */}
            <Route index element={<OverviewPageLazy />} /> {/* Ruta índice por defecto */}
            <Route path="overview" element={<OverviewPageLazy />} />
            <Route path="orders" element={<OrdersPageLazy />} />
            <Route path="addresses" element={<AddressesPageLazy />} />
            <Route path="payments" element={<PaymentsPageLazy />} />
            <Route path="settings" element={<SettingsPageLazy />} />
            
          </Route>
        
        </Route> {/* Fin de Ruta con PublicLayout */}
      </Routes>
    </Suspense>
  );
};