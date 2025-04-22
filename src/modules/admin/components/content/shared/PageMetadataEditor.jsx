import React, { memo } from 'react';

/**
 * Componente reutilizable para editar los metadatos básicos de una página 
 * (Título y Descripción SEO) en los formularios de administración de contenido.
 *
 * @param {object} props
 * @param {string} props.pageTitle - Valor actual del título de la página.
 * @param {string} props.pageDescription - Valor actual de la descripción corta.
 * @param {function} props.onChange - Callback llamado cuando cambia un campo (recibe el evento).
 * @param {boolean} props.isLoading - Indica si los campos deben estar deshabilitados.
 * @returns {JSX.Element}
 */
export const PageMetadataEditor = memo(({ 
  pageTitle, 
  pageDescription, 
  onChange, 
  isLoading 
}) => {
  return (
    <div className="card mb-4">
      <div className="card-header">Información de la Página</div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="pageTitle" className="form-label">Título de la Página</label>
          <input
            type="text"
            className="form-control"
            id="pageTitle" // ID se mantiene, los labels apuntan correctamente
            name="pageTitle" // El name es crucial para que onChange funcione
            value={pageTitle || ''} // Usa la prop
            onChange={onChange} // Usa el callback de la prop
            disabled={isLoading} // Usa la prop
          />
        </div>
        <div className="mb-3">
          <label htmlFor="pageDescription" className="form-label">Descripción Corta (SEO)</label>
          <textarea
            className="form-control"
            id="pageDescription"
            name="pageDescription"
            rows="3"
            value={pageDescription || ''} // Usa la prop
            onChange={onChange} // Usa el callback de la prop
            disabled={isLoading} // Usa la prop
          ></textarea>
        </div>
      </div>
    </div>
  );
});

PageMetadataEditor.displayName = 'PageMetadataEditor'; 