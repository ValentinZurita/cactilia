// src/modules/admin/routes/AdminRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../../layout/AdminLayout.jsx'
import {
  AdminHomePage,
  AdminLoginPage,
  CategoryManagementPage,
  ProductManagementPage,
  UserManagementPage,
  MediaLibraryPage,
  MediaUploadPage,
} from '../pages/index.js'
import { RequireAdminAuth } from '../components/login/index.js'
import { HomePageManagementPage } from '../components/content/homepage/HomePageManagementPage.jsx'
import { ShopPageManagementPage } from '../components/content/shop/ShopPageManagementPage.jsx'
import ContactPageManagementPage from '../components/content/contact/ContactPageManagementPage.jsx'

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

          {/* Media Library */}
          <Route path="media" element={<Navigate to="media/browse" />} />
          <Route path="media/browse" element={<MediaLibraryPage />} />
          <Route path="media/upload" element={<MediaUploadPage />} />

          {/* Content Management - Homepage, Shop Editor and Contact Editor */}
          <Route path="homepage" element={<HomePageManagementPage />} />
          <Route path="shoppage" element={<ShopPageManagementPage />} />
          <Route path="contactpage" element={<ContactPageManagementPage />} />

          {/* Users */}
          <Route path="users" element={<Navigate to="users/customers" />} />
          <Route path="users/:type" element={<UserManagementPage />} />
          <Route path="users/:type/:mode/:id?" element={<UserManagementPage />} />

          {/* Rutas solo para superadmin */}
          <Route element={<RequireAdminAuth superadminOnly={true} />}>
            <Route path="superadmin/roles" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* 3) Anything else => login */}
      <Route path="*" element={<Navigate to="login" />} />
    </Routes>
  );
};