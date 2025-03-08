import { useState, useEffect } from 'react';
import { FieldText, FieldToggle, FieldSelect, FieldMedia } from '../../common/FormFields';
import { getCollections } from '../../../../services/collectionsService';

/**
 * Editor del Hero Slider mostrando nombres de colecciones
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque a editar
 * @param {Function} props.onChange - Función para actualizar el bloque
 * @param {Function} props.onMediaSelect - Función para abrir el selector de medios
 * @returns {JSX.Element}
 */
export const HeroSliderEditor = ({ block, onChange, onMediaSelect }) => {
  // Estado para opciones avanzadas
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Estado para almacenar los datos de colecciones
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Cargar colecciones al montar el componente
  useEffect(() => {
    const fetchCollections = async () => {
      setLoadingCollections(true);
      try {
        const result = await getCollections();
        if (result.ok) {
          setCollections(result.data);
        }
      } catch (error) {
        console.error("Error cargando colecciones:", error);
      } finally {
        setLoadingCollections(false);
      }
    };

    fetchCollections();
  }, []);

  // Verificar que el bloque sea válido
  if (!block || block.type !== 'hero-slider') {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Este editor es para bloques de tipo "hero-slider"
      </div>
    );
  }

  // Función para obtener el nombre de la colección según el ID
  const getCollectionName = (collectionId) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.name : 'Colección no encontrada';
  };

  // Función mejorada para manejar la selección de medios
  const handleMediaSelect = (fieldName) => {
    // Indicar si estamos seleccionando una colección
    const isCollection = fieldName === 'collectionId';
    onMediaSelect(fieldName, isCollection);
  };

  return (
    <div className="hero-slider-editor">
      {/* Mensaje introductorio */}
      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Banner principal</strong> - Esta es la primera sección que verán tus visitantes
      </div>

      {/* Sección 1: Contenido principal */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0"><i className="bi bi-type me-2"></i>Contenido principal</h6>
        </div>
        <div className="card-body">
          {/* Título */}
          <FieldText
            name="title"
            label="Título principal"
            value={block.title || ''}
            onChange={(value) => onChange({ title: value })}
            placeholder="Ej: Bienvenidos a nuestra tienda"
          />

          {/* Subtítulo */}
          <FieldText
            name="subtitle"
            label="Subtítulo"
            value={block.subtitle || ''}
            onChange={(value) => onChange({ subtitle: value })}
            placeholder="Ej: Los mejores productos para ti"
          />
        </div>
      </div>

      {/* Sección 2: Imágenes */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0"><i className="bi bi-image me-2"></i>Imágenes</h6>
        </div>
        <div className="card-body">
          {/* Selector de tipo de imagen */}
          <div className="mb-3">
            <label className="form-label">Fuente de imágenes</label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="imageSource"
                id="btnSingleImage"
                checked={!block.useCollection}
                onChange={() => onChange({ useCollection: false })}
                autoComplete="off"
              />
              <label className="btn btn-outline-primary" htmlFor="btnSingleImage">
                <i className="bi bi-image me-2"></i>Imagen única
              </label>

              <input
                type="radio"
                className="btn-check"
                name="imageSource"
                id="btnCollection"
                checked={block.useCollection === true}
                onChange={() => onChange({ useCollection: true })}
                autoComplete="off"
              />
              <label className="btn btn-outline-primary" htmlFor="btnCollection">
                <i className="bi bi-images me-2"></i>Colección de imágenes
              </label>
            </div>
          </div>

          {/* Imagen principal o colección según la selección */}
          {block.useCollection ? (
            // Selector de colección con nombre de colección
            <div className="mb-3">
              <label className="form-label">Colección de imágenes</label>
              {block.collectionId ? (
                <div className="mb-2">
                  <div className="d-flex align-items-center p-2 bg-light rounded border">
                    <i className="bi bi-collection-fill text-primary me-2 fs-5"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">{getCollectionName(block.collectionId)}</div>
                      <div className="text-muted small">ID: {block.collectionId}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleMediaSelect('collectionId')}
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : loadingCollections ? (
                <div className="d-flex align-items-center p-3 bg-light rounded border">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  <span>Cargando colecciones...</span>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleMediaSelect('collectionId')}
                  >
                    <i className="bi bi-collection me-2"></i>
                    Seleccionar colección
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Selector de imagen única
            <FieldMedia
              name="mainImage"
              label="Imagen principal"
              value={block.mainImage || ''}
              onChange={(value) => onChange({ mainImage: value })}
              onBrowse={() => handleMediaSelect('mainImage')}
            />
          )}

          {/* Activar/desactivar opciones del logo */}
          <div className="mb-3">
            <FieldToggle
              name="showLogo"
              label="Mostrar logo"
              checked={block.showLogo !== undefined ? block.showLogo : true}
              onChange={(value) => onChange({ showLogo: value })}
            />
          </div>

          {/* Texto del logo (solo visible si showLogo es true) */}
          {block.showLogo !== false && (
            <FieldText
              name="logoCaption"
              label="Texto debajo del logo (opcional)"
              value={block.logoCaption || ''}
              onChange={(value) => onChange({ logoCaption: value })}
              placeholder="Ej: Desde 1995"
            />
          )}
        </div>
      </div>

      {/* Sección 3: Botón de acción */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0"><i className="bi bi-cursor me-2"></i>Botón de acción</h6>
        </div>
        <div className="card-body">
          <FieldToggle
            name="showButton"
            label="Mostrar botón"
            checked={block.showButton !== undefined ? block.showButton : true}
            onChange={(value) => onChange({ showButton: value })}
          />

          {block.showButton !== false && (
            <>
              <FieldText
                name="buttonText"
                label="Texto del botón"
                value={block.buttonText || 'Conoce Más'}
                onChange={(value) => onChange({ buttonText: value })}
                placeholder="Ej: Comprar ahora"
              />

              <FieldText
                name="buttonLink"
                label="Enlace del botón"
                value={block.buttonLink || '#'}
                onChange={(value) => onChange({ buttonLink: value })}
                placeholder="Ej: /productos"
              />
            </>
          )}
        </div>
      </div>

      {/* Botón para opciones avanzadas */}
      <button
        type="button"
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <i className={`bi bi-gear me-2`}></i>
        {showAdvanced ? 'Ocultar opciones avanzadas' : 'Opciones avanzadas'}
        <i className={`bi bi-chevron-${showAdvanced ? 'up' : 'down'} ms-2`}></i>
      </button>

      {/* Opciones avanzadas (ocultas por defecto) */}
      {showAdvanced && (
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0"><i className="bi bi-sliders me-2"></i>Configuración avanzada</h6>
          </div>
          <div className="card-body">
            <FieldSelect
              name="height"
              label="Altura del banner"
              value={block.height || '100vh'}
              onChange={(value) => onChange({ height: value })}
              options={[
                ['25vh', 'Pequeño (25%)'],
                ['50vh', 'Mediano (50%)'],
                ['75vh', 'Grande (75%)'],
                ['100vh', 'Pantalla completa']
              ]}
            />

            {/* Opciones para rotación automática de imágenes */}
            <FieldToggle
              name="autoRotate"
              label="Rotación automática de imágenes"
              checked={block.autoRotate !== undefined ? block.autoRotate : true}
              onChange={(value) => onChange({ autoRotate: value })}
            />

            {block.autoRotate && (
              <FieldSelect
                name="interval"
                label="Velocidad de cambio"
                value={block.interval || '5000'}
                onChange={(value) => onChange({ interval: parseInt(value) })}
                options={[
                  ['3000', 'Rápido (3s)'],
                  ['5000', 'Medio (5s)'],
                  ['8000', 'Lento (8s)']
                ]}
              />
            )}

            <FieldToggle
              name="showSubtitle"
              label="Mostrar subtítulo"
              checked={block.showSubtitle !== undefined ? block.showSubtitle : true}
              onChange={(value) => onChange({ showSubtitle: value })}
            />
          </div>
        </div>
      )}
    </div>
  );
};