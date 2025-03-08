/**
 * Componente de vista previa para el bloque Hero Slider
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {boolean} [props.isPreview=true] - Si es una vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const HeroSliderPreview = ({ block, isPreview = true }) => {
  // Valores por defecto
  const defaults = {
    title: 'Título Principal',
    subtitle: 'Subtítulo descriptivo',
    showButton: true,
    buttonText: 'Conoce Más',
    buttonLink: '#',
    height: '50vh',
    mainImage: '/public/images/placeholder.jpg',
    showLogo: true,
    showSubtitle: true
  };

  // Determinar qué imágenes usar (colección, imagen principal o placeholder)
  let backgroundImage = block.mainImage || defaults.mainImage;

  // Altura para la vista previa (más pequeña si es preview)
  const previewHeight = isPreview ? '300px' : block.height || defaults.height;

  return (
    <div
      className={`preview-block ${isPreview ? 'preview-scale' : ''}`}
      style={{
        transform: isPreview ? 'scale(0.95)' : 'none',
        transformOrigin: 'top center'
      }}
    >
      <div
        className="hero-preview position-relative text-white text-center d-flex flex-column justify-content-center align-items-center"
        style={{
          height: previewHeight,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Overlay oscuro */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.5 }}
        ></div>

        {/* Contenido del Hero */}
        <div className="position-relative z-1 p-4">
          {block.showLogo && (
            <div className="mb-3">
              <div
                className="bg-white mx-auto"
                style={{
                  width: '120px',
                  height: '40px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="text-muted">LOGO</span>
              </div>
            </div>
          )}

          <h2 className="display-6 fw-bold">{block.title || defaults.title}</h2>

          {block.showSubtitle && (
            <p className="lead">{block.subtitle || defaults.subtitle}</p>
          )}

          {block.showButton && (
            <button className="btn btn-lg text-white btn-success">
              {block.buttonText || defaults.buttonText}
            </button>
          )}
        </div>

        {/* Indicador de auto-rotación */}
        {block.autoRotate && !isPreview && (
          <div className="position-absolute bottom-0 end-0 m-3 badge bg-dark">
            <i className="bi bi-arrow-repeat me-1"></i>
            Auto-rotación: {(block.interval || 5000) / 1000}s
          </div>
        )}
      </div>
    </div>
  );
};