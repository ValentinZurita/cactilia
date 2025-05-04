import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShippingTableContainer } from '../containers/ShippingTableContainer';
import { ShippingFormContainer } from '../containers/ShippingFormContainer';
import { PageHeader } from '../../../common/components/PageHeader';

/**
 * @component ShippingManagementPage
 * @description Página principal para la gestión de reglas de envío.
 * Funciona como un componente de enrutamiento y diseño de alto nivel.
 * Utiliza un componente PageHeader dedicado y renderiza condicionalmente
 * el contenedor de Tabla o Formulario directamente en su JSX.
 *
 * @example
 * // Rutas típicas manejadas:
 * // /admin/shipping -> Muestra Título + ShippingTableContainer
 * // /admin/shipping/create -> Muestra Título + Botón Volver + ShippingFormContainer
 * // /admin/shipping/edit/:id -> Muestra Título + Botón Volver + ShippingFormContainer
 */
export const ShippingManagementPage = () => {
  // Obtiene los parámetros de la URL (modo: 'create'/'edit', id: ID de la regla)
  const { mode, id } = useParams();
  // Hook para la navegación programática
  const navigate = useNavigate();

  // --- Callbacks de Navegación --- 
  // Estas funciones se pasan como props a los contenedores hijos.

  /** Navega de vuelta a la vista de lista principal */
  const handleBackToList = () => navigate('/admin/shipping');

  /** Navega a la vista de creación de una nueva regla */
  const handleCreateNew = () => navigate('/admin/shipping/create');

  /** Navega a la vista de edición para una regla específica */
  const handleEditRule = (ruleId) => navigate(`/admin/shipping/edit/${ruleId}`);

  /**
   * Determina el título de la página según el modo actual ('create', 'edit', o default).
   * @returns {string} Título de la página.
   */
  const getPageTitle = () => {
    switch (mode) {
      case 'create': return 'Nueva Regla de Envío';
      case 'edit': return 'Editar Regla de Envío';
      default: return 'Reglas de Envío'; // Título para la vista de tabla
    }
  };

  // --- Renderizado del Componente --- 
  return (
    <div className="order-management-page">
      {/* Componente dedicado para toda la cabecera */}
      <PageHeader 
        title={getPageTitle()} 
        showBackButton={mode === 'create' || mode === 'edit'} 
        onBackClick={handleBackToList} 
      />
      
      {/* Contenido principal: Renderizado condicionalmente */}
      
      {/* Modo Creación */} 
      {mode === 'create' && (
        <ShippingFormContainer
          mode="create"
          onCancel={handleBackToList} 
          onSuccess={handleBackToList}
        />
      )}

      {/* Modo Edición */} 
      {mode === 'edit' && (
        <ShippingFormContainer
          mode="edit"
          ruleId={id}
          onCancel={handleBackToList}
          onSuccess={handleBackToList}
        />
      )}

      {/* Modo por Defecto (Lista) */} 
      {(!mode || (mode !== 'create' && mode !== 'edit')) && (
        <ShippingTableContainer
          onEdit={handleEditRule}
          onCreateNew={handleCreateNew}
        />
      )}
    </div>
  );
};