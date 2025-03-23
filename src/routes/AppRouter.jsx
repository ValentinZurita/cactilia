import { Routes, Route, Navigate } from "react-router-dom";
import { AuthRoutes } from '../modules/auth/router/AuthRoutes.jsx';
import { AdminRoutes } from '../modules/admin/routes/AdminRoutes.jsx';
import { PublicRoutes } from '../modules/public/router/PublicRoutes.jsx';
import { ShopRoutes } from '../modules/shop/router/ShopRoutes.jsx';
import { CartPage,  } from '../modules/user/pages';
import { ProfileLayout } from '../modules/user/components/profile';
import { OrdersPage, OrderDetailPage, AddressesPage, PaymentsPage, SettingsPage } from '../modules/user/pages';
import { RequireAuth } from '../modules/auth/components/RequireAuth';
import { CheckoutPage } from '../modules/shop/pages/index.js'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/*" element={<AuthRoutes />} />

      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Shop routes */}
      <Route path="/shop/*" element={<ShopRoutes />} />

      {/* User routes - defined explicitly in main router */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />

      {/* Profile routes with authentication */}
      <Route path="/profile" element={<RequireAuth><ProfileLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/profile/orders" replace />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Public routes - keep at bottom */}
      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  );
};