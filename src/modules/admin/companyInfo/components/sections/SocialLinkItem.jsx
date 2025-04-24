import React from 'react';
import PropTypes from 'prop-types';
import { ActionButton } from '../../../common/components/ActionButton.jsx';
import { ActionButtonsContainer } from '../../../common/components/ActionButtonsContainer.jsx';

/**
 * @component SocialLinkItem
 * @description Muestra una única fila para una red social configurada, incluyendo icono,
 *              etiqueta, URL (acortada), botón de visibilidad y botón para eliminar.
 */

export const SocialLinkItem = ({ item, onRemove, onToggleVisibility }) => {

  // Función simple para acortar URLs largas para visualización
  const shortenUrl = (url) => {
    if (!url) return '';
    try {
      const parsedUrl = new URL(url);
      // Mostrar dominio y quizás parte del path
      return `${parsedUrl.hostname}${parsedUrl.pathname.substring(0, 15)}${parsedUrl.pathname.length > 15 ? '...' : ''}`;
    } catch (e) {
      // Si no es una URL válida, mostrar como está (acortado si es muy largo)
      return url.length > 30 ? url.substring(0, 27) + '...' : url;
    }
  };

  return (

    <div className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
      
      {/* Sección de Información (Izquierda) */}
      <div className="d-flex align-items-center flex-grow-1 me-3" style={{ minWidth: '200px' }}>
        <i className={`bi ${item.icon || 'bi-link-45deg'} me-3 fs-5`}></i>
        <div>
          <strong className="d-block">{item.label || 'Sin Etiqueta'}</strong>
          <a 
            href={item.url}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-muted text-decoration-none small"
            title={item.url} // Tooltip con URL completa
          >
            {shortenUrl(item.url) || 'Sin URL'}
          </a>
        </div>
      </div>

      {/* Sección de Acciones (Derecha) */}
      <ActionButtonsContainer size="sm" ariaLabel="Acciones de enlace social">

        {/* Botón para Cambiar Visibilidad */}
        <ActionButton
          iconClass={`bi ${item.visible !== false ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}
          title={item.visible !== false ? 'Ocultar enlace' : 'Mostrar enlace'}
          onClick={() => onToggleVisibility(item.id)}
          variant="light"
          textColor="secondary"
          // Sin hoverTextColor específico para el ojo
        />

        {/* Botón para Eliminar */}
        <ActionButton
          iconClass="bi bi-trash"
          title="Eliminar"
          onClick={() => onRemove(item.id)} // Confirmación manejada en el padre
          variant="light"
          textColor="secondary"
          hoverTextColor="danger" // Icono rojo al pasar el ratón
        />

      </ActionButtonsContainer>
    </div>
  );
};

SocialLinkItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    icon: PropTypes.string,
    url: PropTypes.string,
    visible: PropTypes.bool // Aunque no se use visualmente aquí, es parte del dato
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
}; 