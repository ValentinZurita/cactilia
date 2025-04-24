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
  // Estado para controlar la visibilidad del formulario de añadir
  const [showAddForm, setShowAddForm] = useState(false);

  // Obtener la lista de items (asegurarse de que siempre sea un array)
  // Comprobar si 'data' y 'data.items' existen y son un array.
  const currentItems = (data && Array.isArray(data.items)) ? data.items : [];

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

  return (
    <div className="social-media-section">
      {/* Encabezado y Botón de Añadir - Remove h5 */}
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        {/* Empty div to push the button to the right using justify-content-between */}
        <div></div> {/* Remains empty to keep alignment if needed, or remove if title added back */}        
      </div>

      {/* Formulario para Añadir (condicional) */}
      {showAddForm && (
        <AddSocialLinkForm 
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Lista de Enlaces Existentes */}
      <div className="list-group">
        {currentItems.length > 0 ? (
          currentItems.map(item => (
            <SocialLinkItem 
              key={item.id} // Usar el ID único como key
              item={item} 
              onRemove={handleRemove} 
            />
          ))
        ) : (
          <p className="text-muted fst-italic px-3">No hay enlaces a redes sociales añadidos.</p>
        )}
      </div>
      
      {/* Botón para Añadir Nuevo Enlace (visible si el form no está) */}      
      {!showAddForm && (
        // Use the new AddButton component
        <AddButton 
          onClick={() => setShowAddForm(true)}
          title="Añadir Enlace" // Specific title for this instance
          className="mt-3 text-center" // Apply wrapper classes here
          // Default size, color (btn-dark), icon (bi-plus-lg), and hoverScale are fine
        />
      )}

      {/* Nota informativa (si no hay items y el form no está visible) */}
      {!showAddForm && currentItems.length === 0 && (
         <div className="mt-4 text-muted small">
          <i className="bi bi-info-circle me-1"></i>
          Añade enlaces a tus perfiles sociales para que aparezcan en tu sitio.
        </div>
      )}
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