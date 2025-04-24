import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component SocialLinkItem
 * @description Muestra una única fila para una red social configurada, incluyendo icono,
 *              etiqueta, URL (acortada) y un botón para eliminar.
 */
export const SocialLinkItem = ({ item, onRemove }) => {
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
      <div className="d-flex align-items-center flex-grow-1 me-3" style={{ minWidth: '200px' }}>
        <i className={`bi ${item.icon || 'bi-link-45deg'} me-3 fs-5`}></i>
        <div>
          <strong className="d-block">{item.label || 'Sin Etiqueta'}</strong>
          <a 
            href={item.url}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-muted text-decoration-none small"
            title={item.url} // Mostrar URL completa en tooltip del navegador
          >
            {shortenUrl(item.url) || 'Sin URL'}
          </a>
        </div>
      </div>
      <div>
        {/* Podríamos añadir un toggle de visibilidad aquí si quisiéramos */}
        <button 
          type="button" 
          className="btn btn-sm btn-outline-danger" 
          onClick={() => onRemove(item.id)} // Llama a onRemove con el ID
          title="Eliminar"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
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
}; 