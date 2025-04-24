import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { SocialLinkItem } from './SocialLinkItem.jsx';
import { AddSocialLinkForm } from './AddSocialLinkForm.jsx';
// Import the new AddButton
import { AddButton } from '../../../common/components/AddButton.jsx';

/**
 * @component SocialMediaSection
 * @description Sección para gestionar dinámicamente los enlaces a redes sociales de la empresa.
 *              Permite añadir y eliminar enlaces.
 */
const SocialMediaSection = ({ data, onUpdate }) => {

  // ========================================================================
  // 1. Estados y Datos
  // ========================================================================

  // Estado para controlar la visibilidad del formulario de añadir
  const [showAddForm, setShowAddForm] = useState(false);

  // Obtener la lista de items (asegurarse de que siempre sea un array)
  // Si 'data' o 'data.items' no existen o no son array, usar array vacío.
  const currentItems = (data && Array.isArray(data.items)) ? data.items : [];



  // ========================================================================
  // 2. Handlers de Eventos
  // ========================================================================

  /**
   * @function handleAdd
   * @description Añade un nuevo enlace de red social a la lista.
   * @param {object} newItemData - Objeto con { label, icon, url, visible } del nuevo enlace.
   */
  const handleAdd = (newItemData) => {
    const newItem = {
      ...newItemData,
      id: uuidv4(), // Generar un ID único
    };
    const updatedItems = [...currentItems, newItem];
    onUpdate({ items: updatedItems }); // Actualizar el estado padre
    setShowAddForm(false); // Ocultar el formulario después de añadir
  };

  /**
   * @function handleRemove
   * @description Elimina un enlace de red social de la lista basado en su ID.
   * @param {string} idToRemove - El ID del enlace a eliminar.
   */
  const handleRemove = (idToRemove) => {
    const itemToRemove = currentItems.find(item => item.id === idToRemove);
    const confirmMessage = itemToRemove 
      ? `¿Estás seguro de eliminar el enlace a ${itemToRemove.label || 'esta red social'}?`
      : '¿Estás seguro de eliminar este enlace?';
      
    if (window.confirm(confirmMessage)) {
      const updatedItems = currentItems.filter(item => item.id !== idToRemove);
      onUpdate({ items: updatedItems }); // Actualizar el estado padre
    }
  };

  /**
   * @function handleToggleVisibility
   * @description Cambia el estado de visibilidad de un enlace social basado en su ID.
   * @param {string} idToToggle - El ID del enlace a cambiar.
   */
  const handleToggleVisibility = (idToToggle) => {
    const updatedItems = currentItems.map(item => 
      item.id === idToToggle 
        ? { ...item, visible: !(item.visible !== false) } // Toggle visibility, default to true if undefined
        : item
    );
    onUpdate({ items: updatedItems }); // Actualizar el estado padre (que ahora guarda en Firestore)
  };



  // ========================================================================
  // 3. Funciones de Renderizado Locales (Helpers)
  // ========================================================================

  /** Renderiza el encabezado (actualmente vacío, placeholder) */
  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
      <div></div> {/* Placeholder para mantener alineación si se añade título */}        
    </div>
  );

  /** Renderiza el formulario para añadir un nuevo enlace (si está visible) */
  const renderAddForm = () => {
    if (!showAddForm) return null;
    return (
      <AddSocialLinkForm 
        onAdd={handleAdd}
        onCancel={() => setShowAddForm(false)}
      />
    );
  };

  /** Renderiza la lista de enlaces existentes o un mensaje si está vacía */
  const renderLinkList = () => (
    <div className="list-group">
      {currentItems.length > 0 ? (
        currentItems.map(item => (
          <SocialLinkItem 
            key={item.id} // Usar el ID único como key
            item={item} 
            onRemove={handleRemove} 
            onToggleVisibility={handleToggleVisibility} // Pasar el handler
          />
        ))
      ) : (
        <p className="text-muted fst-italic px-3">No hay enlaces a redes sociales añadidos.</p>
      )}
    </div>
  );

  /** Renderiza el botón para mostrar el formulario de añadir (si no está visible) */
  const renderAddButton = () => {
    if (showAddForm) return null;
    return (
      <AddButton 
        onClick={() => setShowAddForm(true)}
        title="Añadir Enlace"
        className="mt-3 text-center"
      />
    );
  };

  /** Renderiza una nota informativa si no hay items y el form no está visible */
  const renderInfoMessage = () => {
    if (showAddForm || currentItems.length > 0) return null;
    return (
       <div className="mt-4 text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        Añade enlaces a tus perfiles sociales para que aparezcan en tu sitio.
      </div>
    );
  };



  // ========================================================================
  // 4. Renderizado Principal del Componente
  // ========================================================================
  
  return (
    <div className="social-media-section">
      {renderHeader()}
      {renderAddForm()}
      {renderLinkList()}
      {renderAddButton()}
      {renderInfoMessage()}
    </div>
  );
};



SocialMediaSection.propTypes = {
  // Aceptar que 'data' puede no tener 'items' o 'items' no ser array inicialmente
  data: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      icon: PropTypes.string,
      url: PropTypes.string,
      visible: PropTypes.bool
    }))
  }), 
  onUpdate: PropTypes.func.isRequired
};

// Valor por defecto para data si no se proporciona
SocialMediaSection.defaultProps = {
  data: { items: [] },
};


export default SocialMediaSection; 