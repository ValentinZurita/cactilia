// src/modules/shop/router/ShopRoutes.jsx

import { Routes, Route } from "react-router-dom";
import { ShopPage, OrderSuccessPage, CheckoutPage } from '../pages'

export const ShopRoutes = () => {
  return (
    <Routes>
      {/** /shop -> ShopPage */}
      <Route index element={<ShopPage />} />

      <Route path="checkout" element={<CheckoutPage />} />

      {/** /shop/order-success/:orderId */}
      <Route path="order-success/:orderId" element={<OrderSuccessPage />} />

    </Routes>
  );
};