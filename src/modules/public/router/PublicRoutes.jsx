import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage.jsx";
import { ShopPage } from "../../shop/pages/ShopPage.jsx";
import { CartPage } from "../../user/pages/CartPage.jsx";
import { AuthRoutes } from "../../auth/router/AuthRoutes.jsx";
import { UserProfilePage } from "../../user/pages/UserProfilePage.jsx";
import { PublicLayout } from '../../../layout/PublicLayout.jsx';
import { RequireAuth } from '../../auth/components/RequireAuth.jsx';

export const PublicRoutes = () => {
  return (

    <Routes>

      <Route element={<PublicLayout />}>

        {/* routes that are not protected */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* if the user is authenticated, show the profile page */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <UserProfilePage />
            </RequireAuth>
          }
        />
      </Route>

    </Routes>

  );
};