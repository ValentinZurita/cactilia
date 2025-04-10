import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AdminLayout } from "../../../layout/AdminLayout";
import { RequireAdminAuth } from "../components/login";
import { Spinner } from "../../../shared/components/spinner/Spinner.jsx";

// Función de ayuda para importar componentes con exportaciones nombradas
const lazyLoadNamed = (importFn, componentName) => {
  return lazy(async () => {
    const module = await importFn();
    return { default: module[componentName] };
  });
};

// Lazy loading de páginas administrativas
const AdminHomePage = lazyLoadNamed(() => import("../pages/AdminHomePage"), "AdminHomePage");
const AdminLoginPage = lazyLoadNamed(() => import("../pages/AdminLoginPage"), "AdminLoginPage");
const CategoryManagementPage = lazyLoadNamed(() => import("../pages/CategoryManagementPage"), "CategoryManagementPage");
const ProductManagementPage = lazyLoadNamed(() => import("../pages/ProductManagementPage"), "ProductManagementPage");
const UserManagementPage = lazyLoadNamed(() => import("../pages/UserManagementPage"), "UserManagementPage");
const MediaLibraryPage = lazyLoadNamed(() => import("../pages/MediaLibraryPage"), "MediaLibraryPage");
const MediaUploadPage = lazyLoadNamed(() => import("../pages/MediaUploadPage"), "MediaUploadPage");
const HomePageManagementPage = lazyLoadNamed(() => import("../components/content/homepage/HomePageManagementPage"), "HomePageManagementPage");
const ShopPageManagementPage = lazyLoadNamed(() => import("../components/content/shop/ShopPageManagementPage"), "ShopPageManagementPage");
const ContactPageManagementPage = lazyLoadNamed(() => import("../components/content/contact/ContactPageManagementPage"), "ContactPageManagementPage");
const OrderManagementPage = lazyLoadNamed(() => import('../components/orders/OrderManagementPage.jsx'), "OrderManagementPage");
const ShippingManagementPage = lazyLoadNamed(() => import('../components/shipping/pages/ShippingManagementPage.jsx'), "ShippingManagementPage");
const ShippingDebugTool = lazyLoadNamed(() => import('../components/dashboard/ShippingDebugTool.jsx'), "ShippingDebugTool");
const CompanyInfoPage = lazyLoadNamed(() => import('../companyInfo/pages/CompanyInfoPage'), "CompanyInfoPage");

// Fallback para cuando se está cargando un componente
const SuspenseFallback = () => <Spinner />;

const AdminRoutes = () => {
  return (
    <Routes>
      {/* 1) Ruta de login de admin, sin protección */}
      <Route path="login" element={
        <Suspense fallback={<SuspenseFallback />}>
          <AdminLoginPage />
        </Suspense>
      } />

      {/* 2) Rutas protegidas de Admin */}
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={
            <Suspense fallback={<SuspenseFallback />}>
              <AdminHomePage />
            </Suspense>
          } />

          {/* Categorías */}
          <Route path="categories" element={<Navigate to="categories/view" />} />
          <Route path="categories/:mode/:id?" element={
            <Suspense fallback={<SuspenseFallback />}>
              <CategoryManagementPage />
            </Suspense>
          } />

          {/* Productos */}
          <Route path="products" element={<Navigate to="products/view" />} />
          <Route path="products/:mode/:id?" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ProductManagementPage />
            </Suspense>
          } />

          {/* Media */}
          <Route path="media" element={<Navigate to="media/browse" />} />
          <Route path="media/browse" element={
            <Suspense fallback={<SuspenseFallback />}>
              <MediaLibraryPage />
            </Suspense>
          } />
          <Route path="media/upload" element={
            <Suspense fallback={<SuspenseFallback />}>
              <MediaUploadPage />
            </Suspense>
          } />

          {/* Content Management */}
          <Route path="homepage" element={
            <Suspense fallback={<SuspenseFallback />}>
              <HomePageManagementPage />
            </Suspense>
          } />
          <Route path="shoppage" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ShopPageManagementPage />
            </Suspense>
          } />
          <Route path="contactpage" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ContactPageManagementPage />
            </Suspense>
          } />

          {/* Orders */}
          <Route path="orders" element={<Navigate to="orders/view" />} />
          <Route path="orders/:mode/:id?" element={
            <Suspense fallback={<SuspenseFallback />}>
              <OrderManagementPage />
            </Suspense>
          } />

          {/* Shipping */}
          <Route path="shipping" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ShippingManagementPage />
            </Suspense>
          } />
          <Route path="shipping/:mode/:id?" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ShippingManagementPage />
            </Suspense>
          } />
          <Route path="shipping-debug" element={
            <Suspense fallback={<SuspenseFallback />}>
              <ShippingDebugTool />
            </Suspense>
          } />

          {/* Users */}
          <Route path="users" element={<Navigate to="users/customers" />} />
          <Route path="users/:type" element={
            <Suspense fallback={<SuspenseFallback />}>
              <UserManagementPage />
            </Suspense>
          } />
          <Route path="users/:type/:mode/:id?" element={
            <Suspense fallback={<SuspenseFallback />}>
              <UserManagementPage />
            </Suspense>
          } />

          {/* Datos de la Empresa */}
          <Route path="company-info" element={
            <Suspense fallback={<SuspenseFallback />}>
              <CompanyInfoPage />
            </Suspense>
          } />

          {/* Ejemplo de rutas exclusivas superadmin */}
          <Route element={<RequireAdminAuth superadminOnly={true} />}>
            <Route path="superadmin/roles" element={
              <Suspense fallback={<SuspenseFallback />}>
                <UserManagementPage />
              </Suspense>
            } />
          </Route>
        </Route>
      </Route>

      {/* 3) Cualquier otra -> login admin */}
      <Route path="*" element={<Navigate to="login" />} />
    </Routes>
  );
};

export default AdminRoutes;