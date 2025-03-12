import { useState, useEffect } from 'react';
import { getCollectionImages } from '../../services/collectionsService';
import { heroImages } from '../../../../shared/constants/images';

/**
 * Componente de vista previa para el banner de la tienda
 * Muestra cómo se verá el banner con la configuración actual
 *
 * @param {Object} config - Configuración actual del banner
 * @returns {JSX.Element}
 */
export const ShopBannerPreview = ({ config }) => {
  const [collectionImages, setCollectionImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar imágenes de colección si es necesario
  useEffect(() => {
    const loadCollectionImages = async () => {
      if (config.useCollection && config.collectionId) {
        setLoading(true);
        try {
          const result = await getCollectionImages(config.collectionId);
          if (result.ok && Array.isArray(result.data)) {
            const imageUrls = result.data.map(item => item.url);
            setCollectionImages(imageUrls);
          }
        } catch (error) {
          console.error('Error cargando imágenes:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCollectionImages();
  }, [config.useCollection, config.collectionId]);

  // Determinar la imagen de fondo a mostrar
  const getBackgroundImage = () => {
    if (config.useCollection && collectionImages.length > 0) {
      return `url(${collectionImages[0]})`;
    }

    if (config.backgroundImage) {
      return `url(${config.backgroundImage})`;
    }

    return `url(${heroImages[0]})`;
  };

  return (
    <div className="shop-banner-preview mb-4">
      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Vista Previa</h6>

      <div
        className="preview-container position-relative rounded overflow-hidden"
        style={{
          height: '200px',
          backgroundImage: getBackgroundImage(),
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex flex-column justify-content-center align-items-center text-white p-3"
        >
          {/* Logo */}
          {config.showLogo !== false && (
            <div className="mb-2">
              <span className="badge bg-light text-dark px-3 py-2">LOGO</span>
            </div>
          )}

          {/* Título */}
          <h3 className="h4 mb-2">{config.title || "Tienda de Cactilia"}</h3>

          {/* Subtítulo */}
          {config.showSubtitle !== false && (
            <p className="small mb-0">{config.subtitle || "Encuentra productos frescos y naturales"}</p>
          )}
        </div>

        {/* Indicador de carga */}
        {loading && (
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-muted small text-center">
        <i className="bi bi-info-circle me-1"></i>
        Esta es una vista previa simplificada. Visita la página de tienda para ver el resultado final.
      </div>
    </div>
  );
};