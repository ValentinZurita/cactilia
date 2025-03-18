import { Routes, Route, Navigate } from 'react-router-dom';
import { ShopPage, CheckoutPage } from '../pages';
import { PublicLayout } from '../../../layout/PublicLayout';

export const ShopRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ShopPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>
    </Routes>
  );
};