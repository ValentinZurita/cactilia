import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "../../../layout/AdminLayout";
import {
  AdminHomePage,
  AdminLoginPage,
  CategoryManagementPage,
  ProductManagementPage,
  UserManagementPage,
  MediaLibraryPage,
  MediaUploadPage,
} from "../pages";
import { RequireAdminAuth } from "../components/login";
import { HomePageManagementPage } from "../components/content/homepage/HomePageManagementPage";
import { ShopPageManagementPage } from "../components/content/shop/ShopPageManagementPage";
import ContactPageManagementPage from "../components/content/contact/ContactPageManagementPage";
import { OrderManagementPage } from '../components/orders/OrderManagementPage.jsx'
import { ShippingManagementPage } from '../components/shipping/pages/ShippingManagementPage.jsx'

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* 1) Ruta de login de admin, sin protección */}
      <Route path="login" element={<AdminLoginPage />} />

      {/* 2) Rutas protegidas de Admin */}
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<AdminHomePage />} />

          {/* Categorías */}
          <Route path="categories" element={<Navigate to="categories/view" />} />
          <Route path="categories/:mode/:id?" element={<CategoryManagementPage />} />

          {/* Productos */}
          <Route path="products" element={<Navigate to="products/view" />} />
          <Route path="products/:mode/:id?" element={<ProductManagementPage />} />

          {/* Media */}
          <Route path="media" element={<Navigate to="media/browse" />} />
          <Route path="media/browse" element={<MediaLibraryPage />} />
          <Route path="media/upload" element={<MediaUploadPage />} />

          {/* Content Management */}
          <Route path="homepage" element={<HomePageManagementPage />} />
          <Route path="shoppage" element={<ShopPageManagementPage />} />
          <Route path="contactpage" element={<ContactPageManagementPage />} />

          {/* Orders */}
          <Route path="orders" element={<Navigate to="orders/view" />} />
          <Route path="orders/:mode/:id?" element={<OrderManagementPage />} />

          {/* Shipping */}
          <Route path="shipping" element={<ShippingManagementPage />} />
          <Route path="shipping/:mode/:id?" element={<ShippingManagementPage />} />

          {/* Users */}
          <Route path="users" element={<Navigate to="users/customers" />} />
          <Route path="users/:type" element={<UserManagementPage />} />
          <Route path="users/:type/:mode/:id?" element={<UserManagementPage />} />

          {/* Ejemplo de rutas exclusivas superadmin */}
          <Route element={<RequireAdminAuth superadminOnly={true} />}>
            <Route path="superadmin/roles" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* 3) Cualquier otra -> login admin */}
      <Route path="*" element={<Navigate to="login" />} />
    </Routes>
  );
};