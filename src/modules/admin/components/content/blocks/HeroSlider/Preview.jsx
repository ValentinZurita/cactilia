import { useState, useEffect } from 'react';
import { getCollections, getMediaByCollection } from '../../../../services/collectionsService';

/**
 * Componente de vista previa para el bloque Hero Slider
 * Con transiciones suaves entre imágenes
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {boolean} [props.isPreview=true] - Si es una vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const HeroSliderPreview = ({ block, isPreview = true }) => {
  // Estado para colecciones y datos de colección
  const [collectionData, setCollectionData] = useState({
    name: '',
    loading: false,
    images: []
  });

  // Estados para manejar la transición de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previousImageIndex, setPreviousImageIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cargar datos de la colección cuando cambie la colección seleccionada
  useEffect(() => {
    // Sólo cargar si estamos usando una colección y tenemos su ID
    if (block.useCollection && block.collectionId) {
      const fetchCollectionData = async () => {
        setCollectionData(prev => ({ ...prev, loading: true }));

        try {
          // 1. Obtener información de la colección (para el nombre)
          const collectionsResult = await getCollections();
          let collectionName = 'Colección';

          if (collectionsResult.ok) {
            const collection = collectionsResult.data.find(c => c.id === block.collectionId);
            if (collection) {
              collectionName = collection.name;
            }
          }

          // 2. Cargar las imágenes de la colección
          const mediaResult = await getMediaByCollection(block.collectionId);
          let collectionImages = [];

          if (mediaResult.ok && mediaResult.data && mediaResult.data.length > 0) {
            // Extraer las URLs de las imágenes
            collectionImages = mediaResult.data.map(item => item.url);
          }

          // Actualizar el estado con los datos obtenidos
          setCollectionData({
            name: collectionName,
            loading: false,
            images: collectionImages
          });

          // Reiniciar el índice de imagen al cambiar la colección
          setCurrentImageIndex(0);
          setPreviousImageIndex(null);

        } catch (error) {
          console.error("Error cargando datos de colección:", error);
          setCollectionData({
            name: 'Error al cargar colección',
            loading: false,
            images: []
          });
        }
      };

      fetchCollectionData();
    } else {
      // Resetear los datos de colección si no estamos usando una
      setCollectionData({
        name: '',
        loading: false,
        images: []
      });
    }
  }, [block.useCollection, block.collectionId]);

  // Configurar rotación automática de imágenes
  useEffect(() => {
    // Solo activar la rotación si:
    // 1. autoRotate está activado
    // 2. Tenemos más de una imagen
    // 3. Estamos usando una colección
    if (block.autoRotate && collectionData.images.length > 1 && block.useCollection) {
      const interval = setInterval(() => {
        // Guardar la imagen actual antes de cambiar
        setPreviousImageIndex(currentImageIndex);
        setIsTransitioning(true);

        // Cambiar a la siguiente imagen
        setCurrentImageIndex(prevIndex =>
          (prevIndex + 1) % collectionData.images.length
        );

        // Terminar transición después de un tiempo
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500); // Duración de la transición

      }, block.interval || 5000); // Usar intervalo del bloque o 5000ms por defecto

      // Limpiar el intervalo al desmontar o cambiar dependencias
      return () => clearInterval(interval);
    }
  }, [block.autoRotate, collectionData.images, block.interval, block.useCollection, currentImageIndex]);

  // Valores por defecto
  const defaults = {
    title: 'Título Principal',
    subtitle: 'Subtítulo descriptivo',
    showButton: true,
    buttonText: 'Conoce Más',
    buttonLink: '#',
    height: '100vh',
    mainImage: '/public/images/placeholder.jpg',
    showLogo: true,
    logoCaption: '',
  };

  // Determinar imagen a mostrar
  let backgroundImage = defaults.mainImage;
  let previousImage = null;

  // Si está usando una colección y hay imágenes disponibles
  if (block.useCollection && collectionData.images.length > 0) {
    backgroundImage = collectionData.images[currentImageIndex];

    // Si hay una imagen previa y estamos en transición, guardarla
    if (previousImageIndex !== null && isTransitioning) {
      previousImage = collectionData.images[previousImageIndex];
    }
  }
  // Si no usa colección, pero tiene imagen principal
  else if (!block.useCollection && block.mainImage) {
    backgroundImage = block.mainImage;
  }

  // Determinar altura para previsualización
  const previewHeight = isPreview ? '500px' : block.height || defaults.height;

  // Verificar si usa colección y tiene imágenes
  const usesCollection = block.useCollection && block.collectionId;
  const hasCollectionImages = collectionData.images.length > 0;

  return (
    <div className="preview-container w-100 mb-4">
      {/* Simular exactamente el HeroSection component */}
      <section
        className="hero-section position-relative text-white text-center d-flex flex-column justify-content-center align-items-center"
        style={{
          height: previewHeight,
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
      >
        {/* Imagen de fondo principal */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 0.5s ease',
            zIndex: 0
          }}
        ></div>

        {/* Imagen de fondo anterior (para transición) */}
        {previousImage && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundImage: `url(${previousImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isTransitioning ? 1 : 0,
              transition: 'opacity 0.5s ease',
              zIndex: 0
            }}
          ></div>
        )}

        {/* Overlay oscuro */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1 }}
        ></div>

        {/* Contenido del Hero */}
        <div className="position-relative" style={{ zIndex: 2 }}>
          {/* Logo Component */}
          {(block.showLogo !== false) && (
            <div className="text-center mb-4">
              <img
                src="/public/images/logo.png"
                alt="Logo"
                className="img-fluid rounded-circle shadow-lg"
                style={{ maxWidth: '150px' }}
              />
              {block.logoCaption && (
                <p
                  className="mt-2 text-white"
                  style={{
                    fontSize: '1rem',
                    fontFamily: 'Nohemi, sans-serif',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                  }}
                >
                  {block.logoCaption}
                </p>
              )}
            </div>
          )}

          {/* Título */}
          <h1 className="display-6 fw-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {block.title || defaults.title}
          </h1>

          {/* Subtítulo */}
          {(block.showSubtitle !== false) && (
            <p
              className="lead text-xs mb-4"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              {block.subtitle || defaults.subtitle}
            </p>
          )}

          {/* Botón */}
          {(block.showButton !== false) && (
            <a
              href={block.buttonLink || defaults.buttonLink}
              className="btn btn-lg text-white btn-success text-xs"
              style={{ backgroundColor: "var(--green-1, #28a745)" }}
            >
              {block.buttonText || defaults.buttonText}
            </a>
          )}
        </div>

        {/* Indicadores de previsualización e imágenes */}
        <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-75 text-white small text-center">
          {usesCollection ? (
            <div>
              <span className="badge bg-info me-2">
                <i className="bi bi-collection me-1"></i>
                {collectionData.loading ? 'Cargando colección...' : collectionData.name}
              </span>

              {hasCollectionImages ? (
                <span className="badge bg-success mx-1">
                  <i className="bi bi-images me-1"></i>
                  {collectionData.images.length} imágenes
                </span>
              ) : (
                <span className="badge bg-warning mx-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Sin imágenes
                </span>
              )}

              {block.autoRotate && hasCollectionImages && collectionData.images.length > 1 && (
                <span className="ms-1 badge bg-primary">
                  <i className="bi bi-arrow-repeat me-1"></i>
                  Rotando cada {(block.interval || 5000) / 1000}s
                </span>
              )}
            </div>
          ) : (
            <span>Vista previa del banner</span>
          )}
        </div>

        {/* Indicadores de navegación para múltiples imágenes */}
        {usesCollection && hasCollectionImages && collectionData.images.length > 1 && (
          <div className="position-absolute bottom-10 start-0 end-0 mb-4 z-10" style={{ zIndex: 3 }}>
            <div className="d-flex justify-content-center">
              {collectionData.images.map((_, index) => (
                <button
                  key={index}
                  className="btn btn-sm mx-1 p-0"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    padding: 0
                  }}
                  onClick={() => {
                    setPreviousImageIndex(currentImageIndex);
                    setIsTransitioning(true);
                    setCurrentImageIndex(index);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};