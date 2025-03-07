import { useState, useEffect } from "react";
import { ImageGallery } from '../../../../shared/components/images/index.js'
import { heroImages } from '../../../../shared/constants/images.js'
import { Logo } from '../../../../shared/components/logo/Logo.jsx'
import '../../../../styles/global.css'

/**
 * HeroSection Component
 * Muestra un slider hero con título, subtítulo y botón opcional
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
 * @returns {JSX.Element}
 */
export const HeroSection = ({
                              images, // Puede ser un array o un string
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
                            }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Normalizar las imágenes a un array
  const imageArray = Array.isArray(images) ? images : [images];

  // Si autoRotate está activado, cambia la imagen cada X segundos
  useEffect(() => {
    if (autoRotate && imageArray.length > 1) {
      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
      }, interval);

      return () => clearInterval(imageInterval); // Cleanup interval
    }
  }, [autoRotate, imageArray, interval]);

  return (
    <section
      className="hero-section position-relative text-white text-center d-flex flex-column justify-content-center align-items-center"
      style={{ height }}
    >
      {/* Si hay más de una imagen y autoRotate está activado, rota las imágenes */}
      <ImageGallery
        images={autoRotate && imageArray.length > 1 ? [imageArray[currentImageIndex]] : [imageArray[0]]}
        className="position-absolute top-0 start-0 w-100 h-100"
      />

      {/* Overlay oscuro */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>

      {/* Contenido del Hero */}
      <div className="position-relative z-1">
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