import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../../layout/AdminLayout.jsx'
import {
  AdminHomePage,
  AdminLoginPage,
  CategoryManagementPage,
  ProductManagementPage,
  UserManagementPage,
  MediaLibraryPage,  // NEW
  MediaUploadPage,    // NEW
} from '../pages/index.js'
import { RequireAdminAuth } from '../components/login/index.js'

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