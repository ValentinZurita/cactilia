import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PublicLayout } from '../layout/PublicLayout'
import { RequireAuth } from '../modules/auth/components/RequireAuth'
import { ProfileLayout } from '../modules/user/components/profile/index.js'

// --- Stripe --- ADDED
import { StripeProvider } from '../contexts/StripeContext.jsx'

// Componente de carga
import { Spinner } from '../shared/components/spinner/Spinner.jsx'

// Importaciones estándar para AuthRoutes y AdminRoutes (que tienen export default)
const AuthRoutes = lazy(() => import('../modules/auth/router/AuthRoutes'))
const AdminRoutes = lazy(() => import('../modules/admin/routes/AdminRoutes'))
const ShopRoutes = lazy(() => import('../modules/shop/router/ShopRoutes'))

// Función de ayuda para importar componentes con exportaciones nombradas
const lazyLoadNamed = (importFn, componentName) => {
  return lazy(async () => {
    const module = await importFn()
    return { default: module[componentName] }
  })
}

// Lazy loading de páginas con exportaciones nombradas
const HomePage = lazyLoadNamed(() => import('../modules/public/pages/HomePage.jsx'), 'HomePage')
const ContactPage = lazyLoadNamed(() => import('../modules/public/pages/ContactPage.jsx'), 'ContactPage')
const FaqPage = lazyLoadNamed(() => import('@modules/public/components/faq/pages/FaqPage.jsx'), 'FaqPage')
const CookiesPolicyPage = lazyLoadNamed(() => import('@modules/public/components/cookies-policy/pages/CookiesPolicyPage.jsx'), 'CookiesPolicyPage')
const CartPage = lazyLoadNamed(() => import('../modules/shop/pages/CartPage.jsx'), 'CartPage')
const CheckoutPage = lazyLoadNamed(() => import('@modules/checkout/shipping/CheckoutPage.jsx'), 'CheckoutPage')

// Lazy loading de páginas de perfil con exportaciones nombradas
const OrdersPage = lazyLoadNamed(() => import('../modules/user/pages/OrdersPage.jsx'), 'OrdersPage')
const OrderDetailPage = lazyLoadNamed(() => import('../modules/user/pages/OrderDetailPage.jsx'), 'OrderDetailPage')
const AddressesPage = lazy(() => import('../modules/user/pages/AdressesPage.jsx'))
const PaymentsPage = lazyLoadNamed(() => import('../modules/user/pages/PaymentsPage.jsx'), 'PaymentsPage')
const SettingsPage = lazyLoadNamed(() => import('../modules/user/pages/SettingsPage.jsx'), 'SettingsPage')

// Fallback para cuando se está cargando un componente
const SuspenseFallback = () => <Spinner />

export const AppRouter = () => {
  return (
    <Routes>
      {/** 1) Rutas de administrador (tienen AdminLayout dentro) */}
      <Route path="/admin/*" element={
        <Suspense fallback={<SuspenseFallback />}>
          <AdminRoutes />
        </Suspense>
      } />

      {/** 2) Rutas públicas/usuario, con PublicLayout */}
      <Route path="/" element={<PublicLayout />}>
        {/** Home como ruta index */}
        <Route index element={
          <Suspense fallback={<SuspenseFallback />}>
            <HomePage />
          </Suspense>
        } />

        {/** Incluir rutas de autenticación dentro del PublicLayout */}
        <Route path="auth/*" element={
          <Suspense fallback={<SuspenseFallback />}>
            <AuthRoutes />
          </Suspense>
        } />

        {/** Otra pública: /contacto */}
        <Route path="contacto" element={
          <Suspense fallback={<SuspenseFallback />}>
            <ContactPage />
          </Suspense>
        } />

        {/** Nueva ruta: /faq */}
        <Route path="faq" element={
          <Suspense fallback={<SuspenseFallback />}>
            <FaqPage />
          </Suspense>
        } />

        {/** Nueva ruta: /cookies-policy */}
        <Route path="cookies-policy" element={
          <Suspense fallback={<SuspenseFallback />}>
            <CookiesPolicyPage />
          </Suspense>
        } />

        {/** Rutas de la tienda: /shop/... */}
        <Route path="shop/*" element={
          <Suspense fallback={<SuspenseFallback />}>
            <ShopRoutes />
          </Suspense>
        } />

        {/** Carrito (no requiere auth) */}
        <Route path="cart" element={
          <Suspense fallback={<SuspenseFallback />}>
            <CartPage />
          </Suspense>
        } />

        {/** Checkout (requiere auth) */}
        <Route
          path="checkout"
          element={
            <StripeProvider>
              <RequireAuth>
                <Suspense fallback={<SuspenseFallback />}>
                  <CheckoutPage />
                </Suspense>
              </RequireAuth>
            </StripeProvider>
          }
        />

        {/** Rutas anidadas de perfil: /profile/... */}
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfileLayout />
            </RequireAuth>
          }
        >
          {/** Redirección por defecto a /profile/orders */}
          <Route index element={<Navigate to="orders" replace />} />

          <Route path="orders" element={
            <Suspense fallback={<SuspenseFallback />}>
              <OrdersPage />
            </Suspense>
          } />
          <Route path="orders/:orderId" element={
            <Suspense fallback={<SuspenseFallback />}>
              <OrderDetailPage />
            </Suspense>
          } />
          <Route path="addresses" element={
            <Suspense fallback={<SuspenseFallback />}>
              <AddressesPage />
            </Suspense>
          } />
          <Route path="payments" element={
            <StripeProvider>
              <Suspense fallback={<SuspenseFallback />}>
                <PaymentsPage />
              </Suspense>
            </StripeProvider>
          } />
          <Route path="settings" element={
            <Suspense fallback={<SuspenseFallback />}>
              <SettingsPage />
            </Suspense>
          } />

          {/** Si algo no coincide en /profile/... => redirige a orders */}
          <Route path="*" element={<Navigate to="orders" replace />} />
        </Route>

        {/** Cualquier otra ruta que no matchee, a la home */}
        <Route path="*" element={<Navigate to="/" />} />

      </Route> {/* Fin de <Route path="/" element={<PublicLayout />}> */}

    </Routes>
  )
}