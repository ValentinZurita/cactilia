import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '../../auth/components/RequireAuth'
import { ProfileLayout } from '../components/profile/index.js'
import { Spinner } from '../../../shared/components/spinner'

// --- Lazy Load Pages ---
const LazyCheckoutPage = lazy(() =>
  import('../../checkout/pages/CheckoutPage.jsx').then(module => ({ default: module.CheckoutPage })),
)
const LazyOrdersPage = lazy(() =>
  import('../pages/OrdersPage').then(module => ({ default: module.OrdersPage })),
)
const LazyOrderDetailPage = lazy(() =>
  import('../pages/OrderDetailPage').then(module => ({ default: module.OrderDetailPage })),
)
const LazyAddressesPage = lazy(() =>
  import('../pages/AdressesPage').then(module => ({ default: module.AddressesPage })), // Corrected filename potentially? Assuming 'AdressesPage' might be a typo for 'AddressesPage'
)
const LazyPaymentsPage = lazy(() =>
  import('../pages/PaymentsPage').then(module => ({ default: module.PaymentsPage })),
)
const LazySettingsPage = lazy(() =>
  import('../pages/SettingsPage').then(module => ({ default: module.SettingsPage })),
)

export const UserRoutes = () => {
  return (


    // Agregamos un fallback para que se muestre un spinner mientras se carga la página
    <Suspense fallback={<Spinner />}>

      {/* Rutas */}
      <Routes>

        {/* Checkout requiere autenticación */}
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <LazyCheckoutPage />
            </RequireAuth>
          }
        />

        {/* /profile requiere autenticación y muestra ProfileLayout */}
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfileLayout />
            </RequireAuth>
          }
        >
          {/* Redirección por defecto a /profile/orders */}
          <Route index element={<Navigate to="orders" replace />} />

          {/* Diferentes secciones del perfil con lazy loading */}
          <Route path="orders" element={<LazyOrdersPage />} />
          <Route path="orders/:orderId" element={<LazyOrderDetailPage />} />
          <Route path="addresses" element={<LazyAddressesPage />} />
          <Route path="payments" element={<LazyPaymentsPage />} />
          <Route path="settings" element={<LazySettingsPage />} />

          {/* Cualquier ruta dentro de /profile que no exista -> /profile/orders */}
          <Route path="*" element={<Navigate to="orders" replace />} />

        </Route>

        {/* Cualquier ruta fuera de /checkout o /profile (en este contexto) */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

    </Suspense>

  )
}