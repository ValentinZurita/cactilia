import { useState, useEffect } from 'react';
import { FieldText, FieldToggle, FieldSelect, FieldMedia } from '../../common/FormFields';
import { getCollections, getMediaByCollection } from '../../../../services/collectionsService';

/**
 * Editor del Hero Slider mejorado con manejo de colecciones de imágenes
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque a editar
 * @param {Function} props.onChange - Función para actualizar el bloque
 * @param {Function} props.onMediaSelect - Función para abrir el selector de medios
 * @returns {JSX.Element}
 */
export const HeroSliderEditor = ({ block, onChange, onMediaSelect }) => {
  // Estado para secciones colapsables
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    images: true,
    buttons: true,
    advanced: false
  });

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

  // Cargar imágenes de la colección cuando cambia el collectionId
  useEffect(() => {
    const fetchCollectionImages = async () => {
      // Solo cargar si estamos usando una colección y tenemos su ID
      if (block.useCollection && block.collectionId) {
        try {
          const result = await getMediaByCollection(block.collectionId);
          if (result.ok && result.data && result.data.length > 0) {
            // Extraer las URLs de las imágenes
            const imageUrls = result.data.map(item => item.url);

            // Guardar las URLs en el bloque
            onChange({
              collectionImages: imageUrls,
              // También guardar como "images" para compatibilidad
              images: imageUrls
            });
          }
        } catch (error) {
          console.error("Error cargando imágenes de colección:", error);
        }
      }
    };

    if (block.useCollection && block.collectionId) {
      fetchCollectionImages();
    }
  }, [block.useCollection, block.collectionId, onChange]);

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

  // Función para manejar la selección de medios
  const handleMediaSelect = (fieldName) => {
    // Indicar si estamos seleccionando una colección
    const isCollection = fieldName === 'collectionId';
    onMediaSelect(fieldName, isCollection);
  };

  // Manejador para cuando cambia el modo de imagen (único vs colección)
  const handleImageSourceChange = (useCollection) => {
    // Actualizar el modo
    onChange({ useCollection });

    // Si cambiamos a modo de imagen única, limpiar datos de colección
    if (!useCollection) {
      onChange({
        collectionId: null,
        collectionImages: null,
        images: null
      });
    }
  };

  // Función para alternar secciones colapsables
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Componente para sección colapsable
  const CollapsibleSection = ({ id, title, icon, isOpen, children }) => (
    <div className="card mb-4">
      <div
        className="card-header bg-light d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer' }}
        onClick={() => toggleSection(id)}
      >
        <h6 className="mb-0">
          <i className={`bi ${icon} me-2`}></i>
          {title}
        </h6>
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>
      {isOpen && (
        <div className="card-body">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="hero-slider-editor">
      {/* Mensaje introductorio */}
      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Banner principal</strong> - Esta es la primera sección que verán tus visitantes
      </div>

      {/* Sección 1: Contenido principal */}
      <CollapsibleSection
        id="content"
        title="Contenido principal"
        icon="bi-type"
        isOpen={expandedSections.content}
      >
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
      </CollapsibleSection>

      {/* Sección 2: Imágenes */}
      <CollapsibleSection
        id="images"
        title="Imágenes"
        icon="bi-image"
        isOpen={expandedSections.images}
      >
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
              onChange={() => handleImageSourceChange(false)}
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
              onChange={() => handleImageSourceChange(true)}
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

                {/* Indicador de imágenes cargadas */}
                {block.collectionImages && block.collectionImages.length > 0 && (
                  <div className="mt-2 small text-success">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    {block.collectionImages.length} imágenes cargadas
                  </div>
                )}
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
      </CollapsibleSection>

      {/* Sección 3: Botón de acción */}
      <CollapsibleSection
        id="buttons"
        title="Botón de acción"
        icon="bi-cursor"
        isOpen={expandedSections.buttons}
      >
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
      </CollapsibleSection>

      {/* Sección 4: Configuración avanzada */}
      <CollapsibleSection
        id="advanced"
        title="Configuración avanzada"
        icon="bi-sliders"
        isOpen={expandedSections.advanced}
      >
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
      </CollapsibleSection>
    </div>
  );
};