import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../../auth/components/RequireAuth';
import { ProfileLayout } from '../components/profile/ProfileLayout';
import { AddressesPage, OrdersPage, OverviewPage, PaymentsPage, SettingsPage } from '../pages/index.js'

/**
 * UserRoutes
 *
 * Defines routes for the user profile section
 * All routes are protected with RequireAuth
 */
export const UserRoutes = () => {
  return (
    <Routes>
      {/* Default route - redirect to overview */}
      <Route
        path="/"
        element={<RequireAuth><Navigate to="/profile/overview" /></RequireAuth>}
      />

      {/* Profile routes */}
      <Route
        path="/profile"
        element={<RequireAuth><ProfileLayout /></RequireAuth>}
      >
        {/* Default profile route - redirect to overview */}
        <Route index element={<Navigate to="overview" />} />

        {/* Individual profile sections */}
        <Route path="overview" element={<OverviewPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};