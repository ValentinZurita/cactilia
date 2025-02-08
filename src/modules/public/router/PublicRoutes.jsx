import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/index.js'
import { ShopPage } from '../../shop/pages/ShopPage.jsx'
import { CartPage } from '../../user/pages/CartPage.jsx'

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route index element={<HomePage/>} />
      <Route path="shop" element={<ShopPage />} />
      <Route path="cart" element={<CartPage/> }/>
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  );
}