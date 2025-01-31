import { useState, useEffect } from "react";
import { ImageGallery } from '../../../../shared/components/images/index.js'
import { heroImages } from '../../../../shared/constants/images.js'
import { Logo } from '../../../../shared/components/logo/Logo.jsx'
import '../../../../styles/global.css'


export const HeroSection = () => {
  // State to track the current image index for automatic carousel effect
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Effect to change images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup the interval when the component unmounts
  }, []);

  return (
    // Hero section that takes full viewport height
    <section className="hero-section position-relative text-white text-center vh-100 d-flex flex-column justify-content-center align-items-center">

      {/* Background image carousel */}
      <ImageGallery
        images={[heroImages[currentImageIndex]]}
        className="position-absolute top-0 start-0 w-100 h-100"
      />

      {/* Dark overlay to improve text readability */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>

      {/* Hero content: Logo, title, subtitle, and button */}
      <div className="position-relative z-1">
        {/* Display the logo in white */}
        <Logo color="white" />

        {/* Main title */}
        <h1 className="display-4 fw-bold">Bienvenido a Cactilia</h1>

        {/* Subtitle */}
        <p className="lead text-xs">Productos frescos y naturales para una vida mejor</p>

        {/* Call-to-action button */}
        <button className="btn btn-lg text-white btn-success text-xs" style={{ backgroundColor: "var(--green-1)",
        }}>Conoce Más</button>
      </div>
    </section>
  );
};