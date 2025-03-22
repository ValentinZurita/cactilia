/**
 * ShopRoutes.jsx
 *
 * Define las rutas principales relacionadas con el módulo 'shop'.
 */

import { Routes, Route } from 'react-router-dom';
import { ShopPage, CheckoutPage, OrderSuccessPage } from '../pages'
import { PublicLayout } from '../../../layout/PublicLayout';


export const ShopRoutes = () => {
  return (
    <Routes>
      {/* Todas estas rutas usarán el PublicLayout */}
      <Route element={<PublicLayout />}>
        {/* Página de tienda principal */}
        <Route path="" element={<ShopPage />} />

        {/* Página de Checkout */}
        <Route path="checkout" element={<CheckoutPage />} />

        {/* Página de éxito de pedido con :orderId */}
        <Route path="order-success/:orderId" element={<OrderSuccessPage />} />

        {/* Aquí podrías tener más rutas si fuera necesario */}
      </Route>
    </Routes>
  );
};
