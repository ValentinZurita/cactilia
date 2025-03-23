// src/modules/shop/router/ShopRoutes.jsx

import { Routes, Route } from "react-router-dom";
import { ShopPage, OrderSuccessPage } from "../pages";

export const ShopRoutes = () => {
  return (
    <Routes>
      {/** /shop -> ShopPage */}
      <Route index element={<ShopPage />} />

      {/** /shop/order-success/:orderId */}
      <Route path="order-success/:orderId" element={<OrderSuccessPage />} />

    </Routes>
  );
};