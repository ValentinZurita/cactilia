import { Routes, Route } from "react-router-dom";
import { CartPage, CheckoutPage, OrderSuccessPage, ShopPage } from '../pages/index.js'

export const ShopRoutes = () => {

  return (
    <Routes>
      {/** /shop -> ShopPage */}
      <Route index element={<ShopPage />} />

      {/** /shop/cart -> CartPage */}
      <Route path="cart" element={<CartPage />} />

      <Route path="checkout" element={<CheckoutPage />} />

      {/** /shop/order-success/:orderId */}
      <Route path="order-success/:orderId" element={<OrderSuccessPage />} />

    </Routes>
  );

};