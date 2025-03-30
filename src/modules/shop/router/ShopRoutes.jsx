// src/modules/shop/router/ShopRoutes.jsx

import { Routes, Route } from "react-router-dom";
import { ShopPage } from '../pages/ShopPage.jsx'
import { CheckoutPage } from '../pages/CheckoutPage.jsx'
import { OrderSuccessPage } from '../pages/OrderSuccesPage.jsx'


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