// src/modules/shop/router/ShopRoutes.jsx
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner } from "../../../shared/components/spinner/Spinner.jsx";

// Función de ayuda para importar componentes con exportaciones nombradas
const lazyLoadNamed = (importFn, componentName) => {
  return lazy(async () => {
    const module = await importFn();
    return { default: module[componentName] };
  });
};

// Lazy loading de páginas de tienda
const ShopPage = lazyLoadNamed(() => import('../pages/ShopPage'), "ShopPage");
const CartPage = lazyLoadNamed(() => import('../pages/CartPage'), "CartPage");
const CheckoutPage = lazyLoadNamed(() => import('../pages/CheckoutPage'), "CheckoutPage");
// Para OrderSuccesPage ya no necesitamos el lazyLoadNamed porque ahora tiene export default
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccesPage.jsx'));

// Fallback para cuando se está cargando un componente
const SuspenseFallback = () => <Spinner />;

const ShopRoutes = () => {
  return (
    <Routes>
      {/** /shop -> ShopPage */}
      <Route index element={
        <Suspense fallback={<SuspenseFallback />}>
          <ShopPage />
        </Suspense>
      } />

      {/** /shop/cart -> CartPage */}
      <Route path="cart" element={
        <Suspense fallback={<SuspenseFallback />}>
          <CartPage />
        </Suspense>
      } />

      {/** /shop/checkout -> CheckoutPage */}
      <Route path="checkout" element={
        <Suspense fallback={<SuspenseFallback />}>
          <CheckoutPage />
        </Suspense>
      } />

      {/** /shop/order-success/:orderId */}
      <Route path="order-success/:orderId" element={
        <Suspense fallback={<SuspenseFallback />}>
          <OrderSuccessPage />
        </Suspense>
      } />
    </Routes>
  );
};

export default ShopRoutes;