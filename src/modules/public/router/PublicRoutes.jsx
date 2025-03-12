import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage.jsx";
import { ShopPage } from "../../shop/pages/ShopPage.jsx";
import { CartPage } from "../../user/pages/CartPage.jsx";
import { ContactPage } from "../pages/ContactPage.jsx"; // Importamos la página de contacto
import { AuthRoutes } from "../../auth/router/AuthRoutes.jsx";
import { PublicLayout } from '../../../layout/PublicLayout.jsx';
import { RequireAuth } from '../../auth/components/RequireAuth.jsx';
import {
  OverviewPage,
  OrdersPage,
  AddressesPage,
  PaymentsPage,
  SettingsPage
} from '../../user/pages';
import { ProfileLayout } from '../../user/components/profile/index.js'

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Rutas públicas sin protección */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/contacto" element={<ContactPage />} /> {/* Nueva ruta para contacto */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Rutas protegidas del perfil de usuario */}
        <Route path="/profile" element={<RequireAuth><ProfileLayout /></RequireAuth>}>
          <Route index element={<OverviewPage />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};