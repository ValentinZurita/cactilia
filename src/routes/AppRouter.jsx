import { Routes, Route, Navigate } from "react-router-dom";
import { AuthRoutes } from '../modules/auth/router/AuthRoutes.jsx';
import { AdminRoutes } from '../modules/admin/routes/AdminRoutes.jsx';
 // Assuming this is your layout component
import { ShopRoutes } from '../modules/shop/router/ShopRoutes.jsx';
import { ProfileLayout } from '../modules/user/components/profile';
import { OrdersPage, OrderDetailPage, AddressesPage, PaymentsPage, SettingsPage, CartPage } from '../modules/user/pages';
import { RequireAuth } from '../modules/auth/components/RequireAuth';
import { CheckoutPage } from '../modules/shop/pages';
import { HomePage } from '../modules/public/pages';
import { PublicLayout } from '../layout/PublicLayout.jsx'
import { ContactPage } from '../modules/public/pages/ContactPage.jsx' // Assuming this is your home page

export const AppRouter = () => {
  return (
    <Routes>
      {/* Auth routes - typically without the public layout */}
      <Route path="/auth/*" element={<AuthRoutes />} />

      {/* Admin routes - typically with their own layout */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* All other routes with the public layout */}
      <Route element={<PublicLayout />}>
        {/* Shop routes */}
        <Route path="/shop/*" element={<ShopRoutes />} />

        {/* User routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="contacto" element={<ContactPage />} />

        {/* Profile routes with authentication */}
        <Route path="/profile" element={<RequireAuth><ProfileLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/profile/orders" replace />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Home page and other public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};