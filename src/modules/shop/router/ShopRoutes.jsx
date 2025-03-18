import { Routes, Route, Navigate } from 'react-router-dom';
import { ShopPage, CheckoutPage } from '../pages';

export const ShopRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ShopPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>
  );
};