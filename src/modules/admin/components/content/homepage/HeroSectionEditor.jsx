import { useState } from 'react';
import { MediaSelector } from '../../media/index.js';

/**
 * Editor específico para la sección Hero
 * Versión mejorada con soporte para selección de colecciones
 */
export const HeroSectionEditor = ({ data, onUpdate }) => {
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [currentField, setCurrentField] = useState(null);

  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  // Abrir selector de medios para un campo específico
  const openMediaSelector = (field) => {
    setCurrentField(field);
    setShowMediaSelector(true);
  };

  // Abrir selector de colecciones
  const openCollectionSelector = () => {
    setShowCollectionSelector(true);
  };

  // Manejar selección de medios
  const handleMediaSelected = (media) => {
    if (!currentField) return;

    // Si es un array de medios, extraer la URL del primero
    const url = Array.isArray(media)
      ? (media[0]?.url || '')
      : (media?.url || '');

    onUpdate({ [currentField]: url });
    setShowMediaSelector(false);
    setCurrentField(null);
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
    <div className="hero-section-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Contenido Principal</h6>

        {/* Título */}
        <div className="mb-3">
          <label htmlFor="heroTitle" className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            id="heroTitle"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Bienvenido a Cactilia"
          />
        </div>

        {/* Subtítulo */}
        <div className="mb-3">
          <label htmlFor="heroSubtitle" className="form-label">Subtítulo</label>
          <input
            type="text"
            className="form-control"
            id="heroSubtitle"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Ej: Productos frescos y naturales para una vida mejor"
          />

          <div className="form-check form-switch mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="showSubtitle"
              checked={data.showSubtitle !== false}
              onChange={() => handleToggleChange('showSubtitle')}
            />
            <label className="form-check-label" htmlFor="showSubtitle">
              Mostrar subtítulo
            </label>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Imágenes del Slider</h6>

        {/* Selector de origen: Imagen única o Colección */}
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
              : "Se usará solo la imagen seleccionada o la predeterminada"}
          </div>
        </div>

        {/* Contenido condicional según el modo seleccionado */}
        {data.useCollection ? (
          /* Selector de colección */
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
                    <label htmlFor="heroImageSize" className="form-label">Tamaño de Imagen a Usar</label>
                    <select
                      className="form-select form-select-sm" // Usar select pequeño
                      id="heroImageSize"
                      value={data.imageSize || 'original'} // Leer el valor actual, default a 'original'
                      onChange={(e) => handleChange('imageSize', e.target.value)} // Llamar a onUpdate
                    >
                      <option value="original">Original (Máxima calidad)</option>
                      <option value="large">Grande (1200px aprox.)</option>
                      <option value="medium">Mediano (600px aprox.)</option>
                      <option value="small">Pequeño (200px aprox.)</option>
                    </select>
                    <div className="form-text text-muted small">
                      Selecciona qué versión de las imágenes de la colección mostrar. 'Original' usa la imagen completa.
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
        ) : (
          /* Selector de imagen única */
          <div className="mb-3">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 w-sm-auto"
                onClick={() => openMediaSelector('backgroundImage')}
              >
                <i className="bi bi-image me-2"></i>
                {data.backgroundImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </button>

              {data.backgroundImage && (
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 w-sm-auto"
                  onClick={() => handleChange('backgroundImage', '')}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Eliminar imagen
                </button>
              )}
            </div>

            {data.backgroundImage ? (
              <div className="bg-light p-2 rounded">
                <img
                  src={data.backgroundImage}
                  alt="Background"
                  className="img-fluid rounded"
                  style={{ maxHeight: '150px' }}
                />
              </div>
            ) : (
              <div className="text-muted border rounded p-3 text-center bg-light">
                <i className="bi bi-card-image fs-1 d-block mb-2"></i>
                <div className="text-muted">Se usará la imagen predeterminada del sistema</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Opciones del Logo</h6>

        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showLogo"
            checked={data.showLogo !== false}
            onChange={() => handleToggleChange('showLogo')}
          />
          <label className="form-check-label" htmlFor="showLogo">
            Mostrar logo
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Botón de Acción</h6>

        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showButton"
            checked={data.showButton !== false}
            onChange={() => handleToggleChange('showButton')}
          />
          <label className="form-check-label" htmlFor="showButton">
            Mostrar botón
          </label>
        </div>

        {data.showButton !== false && (
          <div className="card bg-light border-0 p-3 mb-3">
            <div className="mb-3">
              <label htmlFor="buttonText" className="form-label">Texto del botón</label>
              <input
                type="text"
                className="form-control"
                id="buttonText"
                value={data.buttonText || 'Conoce Más'}
                onChange={(e) => handleChange('buttonText', e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="buttonLink" className="form-label">Enlace del botón</label>
              <input
                type="text"
                className="form-control"
                id="buttonLink"
                value={data.buttonLink || '#'}
                onChange={(e) => handleChange('buttonLink', e.target.value)}
                placeholder="Ej: /productos"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Configuración avanzada</h6>

        <div className="mb-3">
          <label htmlFor="height" className="form-label">Altura del banner</label>
          <select
            className="form-select"
            id="height"
            value={data.height || '100vh'}
            onChange={(e) => handleChange('height', e.target.value)}
          >
            <option value="25vh">Pequeño (25%)</option>
            <option value="50vh">Mediano (50%)</option>
            <option value="75vh">Grande (75%)</option>
            <option value="100vh">Pantalla completa</option>
          </select>
        </div>

        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="autoRotate"
            checked={data.autoRotate !== false}
            onChange={() => handleToggleChange('autoRotate')}
          />
          <label className="form-check-label" htmlFor="autoRotate">
            Rotación automática de imágenes
          </label>
          <div className="form-text text-muted">
            <small>Requiere múltiples imágenes en la colección seleccionada</small>
          </div>
        </div>
      </div>

      {/* Selector de medios */}
      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        onSelect={handleMediaSelected}
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