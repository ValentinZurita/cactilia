// src/layout/PublicLayout.jsx

import { Outlet } from "react-router-dom";
import { Footer } from "../shared/components/footer/Footer";
import { GlobalMessages } from '../modules/user/components/shared/index.js';

import "../styles/publicLayout.css";
import { Navbar } from '../shared/components/Navbar.jsx'

export const PublicLayout = () => {
  return (
    <div className="public-layout">
      {/* Notificaciones globales */}
      <GlobalMessages />

      {/* Cabecera */}
      <Navbar />

      {/* Contenido central (lo que rendericen las rutas hijas) */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};