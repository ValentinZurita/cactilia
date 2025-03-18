import { Routes, Route, Navigate } from 'react-router-dom';
import { ShopPage, CheckoutPage } from '../pages';

export const ShopRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz para la tienda */}
      <Route path="/" element={<ShopPage />} />

      {/* Ruta de checkout (ahora con path relativo) */}
      <Route path="checkout" element={<CheckoutPage />} />
    </Routes>
  );
};