import { useState } from 'react';
import { MediaSelector } from '../../media/index.js';

/**
 * Editor para la sección de Carrusel de Granja
 * Incluye selector de colección para las imágenes
 */
export const FarmCarouselEditor = ({ data = {}, onUpdate }) => {
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);

  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  // Abrir selector de colecciones
  const openCollectionSelector = () => {
    setShowCollectionSelector(true);
  };

  // Manejar selección de colección
  const handleCollectionSelected = (collection) => {
    if (!collection) return;

    onUpdate({
      useCollection: true,
      collectionId: collection.id,
      collectionName: collection.name
    });

    setShowCollectionSelector(false);
  };

  return (
    <div className="farm-carousel-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3">Contenido Principal</h6>

        {/* Título */}
        <div className="mb-3">
          <label htmlFor="farmTitle" className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            id="farmTitle"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Nuestro Huerto"
          />
        </div>

        {/* Subtítulo */}
        <div className="mb-3">
          <label htmlFor="farmSubtitle" className="form-label">Subtítulo</label>
          <input
            type="text"
            className="form-control"
            id="farmSubtitle"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Ej: Descubre la belleza y frescura de nuestra granja"
          />
        </div>

        {/* Icono */}
        <div className="mb-3">
          <label htmlFor="farmIcon" className="form-label">Icono</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className={`bi ${data.icon || 'bi-tree-fill'}`}></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="farmIcon"
              value={data.icon || 'bi-tree-fill'}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Ej: bi-tree-fill"
            />
          </div>
          <div className="form-text">
            Usa clases de <a href="https://icons.getbootstrap.com/" target="_blank">Bootstrap Icons</a>
          </div>
        </div>
      </div>

      {/* Selector de Colección para imágenes */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3">Imágenes del Carrusel</h6>

        {/* Selector de origen: Colección */}
        <div className="mb-3">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="useCollection"
              checked={data.useCollection === true}
              onChange={() => handleToggleChange('useCollection')}
            />
            <label className="form-check-label" htmlFor="useCollection">
              Usar imágenes de una colección
            </label>
          </div>
          <div className="form-text text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            {data.useCollection
              ? "Se usarán todas las imágenes de la colección seleccionada"
              : "Se usarán imágenes predeterminadas del sistema"}
          </div>
        </div>

        {/* Selector de colección */}
        {data.useCollection && (
          <div className="card bg-light border-0 p-3 mb-3">
            <h6 className="mb-3 text-muted">Colección de imágenes</h6>

            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-3">
              <button
                type="button"
                className="btn btn-outline-primary w-100 w-sm-auto"
                onClick={openCollectionSelector}
              >
                <i className="bi bi-collection me-2"></i>
                {data.collectionId ? 'Cambiar colección' : 'Seleccionar colección'}
              </button>

              {data.collectionId && (
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 w-sm-auto"
                  onClick={() => {
                    onUpdate({
                      useCollection: false,
                      collectionId: null,
                      collectionName: null
                    });
                  }}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Quitar colección
                </button>
              )}
            </div>

            {data.collectionId ? (
              <div className="selected-collection p-3 bg-white rounded border">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">
                    <i className="bi bi-collection me-1"></i>
                    Colección
                  </span>
                  <span className="fw-bold">{data.collectionName || 'Colección seleccionada'}</span>
                </div>

                {/* <<< Selector para el tamaño de imagen de la colección >>> */}
                {data.useCollection && data.collectionId && ( // Mostrar solo si se usa colección y hay una seleccionada
                  <div className="mt-3 mb-3"> {/* Añadir un poco de espacio */}
                    <label htmlFor="farmImageSize" className="form-label">Tamaño de Imagen a Usar</label>
                    <select
                      className="form-select form-select-sm" // Usar select pequeño
                      id="farmImageSize"
                      value={data.imageSize || 'medium'} // Leer el valor actual, default a 'medium' para carruseles
                      onChange={(e) => handleChange('imageSize', e.target.value)} // Llamar a onUpdate
                    >
                      {/* <option value="original">Original (No recomendado para carruseles)</option> */}
                      <option value="large">Grande (1200px aprox.)</option>
                      <option value="medium">Mediano (600px aprox.)</option>
                      <option value="small">Pequeño (200px aprox.)</option>
                    </select>
                    <div className="form-text text-muted small">
                      Selecciona qué versión de las imágenes de la colección mostrar. 'Mediano' es generalmente bueno para carruseles.
                    </div>
                  </div>
                )}
                {/* <<< Fin Selector >>> */}

              </div>
            ) : (
              <div className="text-muted border rounded p-3 text-center bg-white">
                <i className="bi bi-collection fs-1 d-block mb-2"></i>
                Ninguna colección seleccionada
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3">Apariencia</h6>

        {/* Fondo */}
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="farmShowBg"
            checked={data.showBg !== false}
            onChange={() => handleToggleChange('showBg')}
          />
          <label className="form-check-label" htmlFor="farmShowBg">
            Mostrar fondo claro
          </label>
        </div>
      </div>

      {/* Selector de medios */}
      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        onSelect={() => {}}
        title="Seleccionar Imagen"
      />

      {/* Selector de colecciones */}
      <MediaSelector
        isOpen={showCollectionSelector}
        onClose={() => setShowCollectionSelector(false)}
        onSelect={handleCollectionSelected}
        title="Seleccionar Colección de Imágenes"
        selectCollection={true}
      />
    </div>
  );
};