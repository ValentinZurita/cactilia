import React, { useMemo } from "react";
import { Logo } from '../../../../shared/components/logo/Logo.jsx';
import '../../../../styles/global.css';
import './../../styles/homepage.css';
import { useImageSlider } from '../../hooks/useImageSlider';

/**
 * HeroSection Component con transiciones CSS puras
 * Muestra un banner con imágenes rotativas (controlado por useImageSlider)
 *
 * @param {Object} props
 * @param {Array<{id: string, src: string, alt: string}>} props.images - Array de objetos de imagen a mostrar.
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
const HeroSectionComponent = React.memo(({
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
                            }) => {

  // Use the hook to manage slider state and logic
  const { currentIndex } = useImageSlider(images, autoRotate, interval);

  // Memoize image array processing (ensure it's always an array)
  const imageArray = useMemo(() => (
    Array.isArray(images) ? images.filter(img => img?.src) : []
  ), [images]);

  // Function to create styles remains the same, uses currentIndex from hook
  const createImageStyles = (index) => {
    const imageUrl = imageArray[index]?.src; // Get the src URL from the processed array
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: index === currentIndex ? 1 : 0,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      // Consider slightly longer transition for smoother effect
      transition: 'opacity 0.8s ease-in-out', 
      zIndex: index === currentIndex ? 1 : 0
    };
  };
  
  // Handle case where no valid images are available
  if (imageArray.length === 0) {
    // Optionally return a placeholder or null
    // For now, let's render the section without images but with content
    console.warn('HeroSection: No valid images provided.');
    // return null; 
  }

  return (
    <section
      className="hero-section position-relative text-white text-center d-flex flex-column justify-content-center align-items-center"
      style={{ height, overflow: 'hidden' }}
      aria-label={title || 'Hero section'}
      role="region"
    >
      {/* Container for images - only render if images exist */}
      {imageArray.length > 0 && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          aria-live="polite" // Announce changes for screen readers
          aria-atomic="true"
        >
          {imageArray.map((image, index) => (
            <div
              key={image.id || index} // Use image.id if available, otherwise index
              style={createImageStyles(index)}
              role="img" // Role for semantic meaning
              aria-label={image.alt || `Slide ${index + 1}`}
              aria-hidden={index !== currentIndex}
            />
          ))}
        </div>
      )}

      {/* Overlay oscuro */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 2 }}></div>

      {/* Contenido del Hero */}
      <div className="position-relative" style={{ zIndex: 3 }}>
        {showLogo && <Logo color="white" />}
        {/* Use heading levels appropriately */}
        <h1 className="display-6 fw-bold">{title}</h1> 
        {showSubtitle && <p className="lead text-xs">{subtitle}</p>}

        {showButton && (
          <a
            href={buttonLink}
            className="btn btn-lg text-white btn-success text-xs"
            style={{ backgroundColor: "var(--green-1)" }} // Consider moving to CSS class
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
});

// Add display name for React DevTools
HeroSectionComponent.displayName = 'HeroSection';

// Exportar por defecto
export default HeroSectionComponent;