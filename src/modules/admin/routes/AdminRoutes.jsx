import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAdminAuth } from '../components/admin-login-page/index.js'
import { AdminHomePage, AdminLoginPage, ProductManagementPage } from '../pages/index.js'
import { CategoryManagementPage } from '../pages/CategoryManagementPage.jsx'
import { AdminLayout } from '../../../layout/AdminLayout.jsx'



/*
  +---------------------------------------------+
  |                                             |
  | Admin module routes                         |
  |                                             |
  +---------------------------------------------+
 */


export const AdminRoutes = () => {
  return (

    <Routes>

      {/* 1) Public route: login */}
      <Route path="login" element={<AdminLoginPage />} />


      {/* 2) Protected routes */}
      <Route element={<RequireAdminAuth />}>

        {/* Admin layout */}
        <Route element={<AdminLayout />}>

          {/* Home */}
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<AdminHomePage />} />

          {/* Categories */}
          <Route path="categories" element={<Navigate to="categories/view" />} />
          <Route path="categories/:mode/:id?" element={<CategoryManagementPage />} />

          {/* Products */}
          <Route path="products" element={<Navigate to="products/view" />} />
          <Route path="products/:mode/:id?" element={<ProductManagementPage />} />

        </Route>
      </Route>


      {/* 3) Anything else => login */}
      <Route path="*" element={<Navigate to="login" />} />

    </Routes>

  );
};