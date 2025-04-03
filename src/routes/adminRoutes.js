import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importar componentes de shipping desde la nueva estructura
import {
  ShippingManagement,
  CreateRulePage,
  EditRulePage
} from '../modules/admin/shipping';

// Suponer que hay otros componentes importados para otras rutas
// ...

/**
 * Rutas para la administración
 */
const AdminRoutes = () => {
  return (
    <Routes>
      {/* Rutas para shipping */}
      <Route path="/shipping" element={<ShippingManagement />} />
      <Route path="/shipping/create" element={<CreateRulePage />} />
      <Route path="/shipping/edit/:id" element={<EditRulePage />} />
      
      {/* Otras rutas */}
      {/* ... */}
    </Routes>
  );
};

export default AdminRoutes; 