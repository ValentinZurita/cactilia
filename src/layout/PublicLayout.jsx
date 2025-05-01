import { Outlet } from "react-router-dom";
import { Footer } from "../shared/components/footer/Footer";
import { GlobalMessages } from '../modules/user/components/shared/index.js';
import { Navbar } from "../shared/components";
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsProductModalOpen, selectCurrentModalProduct, closeProductModal } from '../store/slices/uiSlice';
import { ProductModal } from '../modules/shop/features/shop/ProductModal';

import "../styles/publicLayout.css";

export const PublicLayout = () => {
  const isModalOpen = useSelector(selectIsProductModalOpen);
  const currentProduct = useSelector(selectCurrentModalProduct);
  const dispatch = useDispatch();

  const handleCloseModal = () => {
    dispatch(closeProductModal());
  };

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

      {/* Renderizar el modal de producto si está abierto (controlado por Redux) */}
      {isModalOpen && currentProduct && (
        <ProductModal
          isOpen={isModalOpen}       // Siempre true si se renderiza aquí
          product={currentProduct}   // Producto del estado global
          onClose={handleCloseModal} // Función para despachar la acción de cierre
        />
      )}
    </div>
  );
};