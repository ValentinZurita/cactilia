import { useState, useEffect, useRef, useMemo } from "react";
import { Logo } from '../../../../shared/components/logo/Logo.jsx';
import { heroImages } from '../../../../shared/constants/images.js';
import { getCollectionImages } from '../../../admin/services/collectionsService.js';
import '../../../../styles/global.css';
import './../../styles/homepage.css';

/**
 * HeroSection Component con transiciones CSS puras
 * Implementa un slider con transiciones fluidas usando CSS puro
 *
 * @param {Object} props
 * @param {string|Array} props.images - Imágenes a mostrar (string o array)
 * @param {string} props.title - Título principal
 * @param {string} props.subtitle - Subtítulo
 * @param {boolean} props.showLogo - Si se muestra el logo
 * @param {boolean} props.showSubtitle - Si se muestra el subtítulo
 * @param {boolean} props.showButton - Si se muestra el botón
 * @param {string} props.buttonText - Texto del botón
 * @param {string} props.buttonLink - URL del botón
 * @param {string} props.height - Altura del hero
 * @param {boolean} props.autoRotate - Si las imágenes rotan automáticamente
 * @param {number} props.interval - Intervalo de rotación en ms
 * @param {string} props.collectionId - ID de la colección de imágenes (opcional)
 * @param {boolean} props.useCollection - Si se debe usar una colección de imágenes
 * @returns {JSX.Element}
 */
export const HeroSection = ({
                              images,
                              title,
                              subtitle,
                              showLogo = true,
                              showSubtitle = true,
                              showButton = true,
                              buttonText = "Conoce Más",
                              buttonLink = "#",
                              height = "100vh",
                              autoRotate = false,
                              interval = 5000,
                              collectionId,
                              useCollection = false,
                            }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collectionImages, setCollectionImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const imagesContainerRef = useRef(null);
  const preloadedImages = useRef(new Set());
  const intervalRef = useRef(null);

  // Cargar imágenes de la colección si se especifica
  useEffect(() => {
    const loadCollectionImages = async () => {
      if (useCollection && collectionId) {
        setLoading(true);
        try {
          const result = await getCollectionImages(collectionId);
          if (result.ok && Array.isArray(result.data)) {
            const imageUrls = result.data.map(item => item.url);
            setCollectionImages(imageUrls);
            // Precargar imágenes
            preloadImages(imageUrls);
          } else {
            console.error('Error cargando imágenes de colección:', result.error);
            setCollectionImages([]);
          }
        } catch (error) {
          console.error('Error cargando imágenes de colección:', error);
          setCollectionImages([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCollectionImages();
  }, [useCollection, collectionId]);

  // Determinar qué imágenes usar
  const imageArray = useMemo(() => {
    if (loading) {
      return [heroImages[0]]; // Imagen de respaldo durante la carga
    }

    if (useCollection && collectionImages.length > 0) {
      return collectionImages;
    }

    // Normalizar las imágenes a un array
    return Array.isArray(images) ? images : [images];
  }, [images, loading, useCollection, collectionImages]);

  // Función para precargar imágenes
  const preloadImages = (imagesToPreload) => {
    imagesToPreload.forEach(url => {
      if (!preloadedImages.current.has(url)) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          preloadedImages.current.add(url);
        };
      }
    });
  };

  // Configurar rotación automática
  useEffect(() => {
    // Precargar todas las imágenes al inicio
    preloadImages(imageArray);

    if (autoRotate && imageArray.length > 1) {
      // Limpiar intervalo existente
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Iniciar nuevo intervalo
      intervalRef.current = setInterval(() => {
        if (!isTransitioning) {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
            setIsTransitioning(false);
          }, 500); // Duración de la transición
        }
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRotate, imageArray, interval, isTransitioning]);

  // Crear estilos CSS para cada imagen
  const createImageStyles = (index) => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: index === currentIndex ? 1 : 0,
      backgroundImage: `url(${imageArray[index]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'opacity 1s ease-in-out',
      zIndex: index === currentIndex ? 1 : 0
    };
  };

  return (
    <section
      className="hero-section position-relative text-white text-center d-flex flex-column justify-content-center align-items-center"
      style={{ height, overflow: 'hidden' }}
    >
      {/* Container para todas las imágenes */}
      <div
        ref={imagesContainerRef}
        className="position-absolute top-0 start-0 w-100 h-100"
      >
        {/* Renderizar todas las imágenes con opacidad controlada */}
        {imageArray.map((_, index) => (
          <div
            key={index}
            style={createImageStyles(index)}
            aria-hidden={index !== currentIndex}
          />
        ))}
      </div>

      {/* Overlay oscuro */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 2 }}></div>

      {/* Contenido del Hero */}
      <div className="position-relative" style={{ zIndex: 3 }}>
        {showLogo && <Logo color="white" />}
        <h1 className="display-6 fw-bold">{title}</h1>
        {showSubtitle && <p className="lead text-xs">{subtitle}</p>}

        {showButton && (
          <a
            href={buttonLink}
            className="btn btn-lg text-white btn-success text-xs"
            style={{ backgroundColor: "var(--green-1)" }}
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
};