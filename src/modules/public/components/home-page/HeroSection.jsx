import { useState, useEffect } from "react";
import { ImageGallery } from '../../../../shared/components/images/index.js'
import { heroImages } from '../../../../shared/constants/images.js'
import { Logo } from '../../../../shared/components/logo/Logo.jsx'
import '../../../../styles/global.css'


export const HeroSection = ({
                              images, // 🔥 Ahora puede ser una imagen estática o un array de imágenes
                              title,
                              subtitle,
                              showLogo = true,
                              showSubtitle = true,
                              showButton = true,
                              height = "100vh",
                              autoRotate = false, // 🔥 Si es true, rota imágenes automáticamente
                              interval = 5000, // 🔥 Tiempo entre imágenes en milisegundos
                            }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 🔥 Si autoRotate está activado, cambia la imagen cada X segundos
  useEffect(() => {
    if (autoRotate && images.length > 1) {
      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, interval);

      return () => clearInterval(imageInterval); // Cleanup interval
    }
  }, [autoRotate, images, interval]);

  return (
    <section
      className="hero-section position-relative text-white text-center d-flex flex-column justify-content-center align-items-center"
      style={{ height }}
    >
      {/* 🔥 Si hay más de una imagen y autoRotate está activado, rota las imágenes */}
      <ImageGallery
        images={autoRotate && images.length > 1 ? [images[currentImageIndex]] : [images[0]]}
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
          <button
            className="btn btn-lg text-white btn-success text-xs"
            style={{ backgroundColor: "var(--green-1)" }}
          >
            Conoce Más
          </button>
        )}
      </div>
    </section>
  );
};