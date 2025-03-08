// Componente para los bloques de texto
export const CustomTextBlock = ({ title, content, alignment, showBg }) => (
  <section className={`py-5 ${showBg ? 'bg-light' : ''}`}>
    <div className="container">
      <div className={`text-${alignment}`}>
        {title && <h2 className="mb-4">{title}</h2>}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  </section>
);

// Componente para bloques de llamada a la acción
export const CustomCTABlock = ({ title, subtitle, buttonText, buttonLink, alignment, backgroundImage }) => (
  <div className="cta-section py-5" style={{
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: !backgroundImage ? '#f8f9fa' : 'transparent'
  }}>
    <div className="container">
      <div className={`text-${alignment} py-5`}>
        <h2 className="mb-3">{title}</h2>
        <p className="lead mb-4">{subtitle}</p>
        <a href={buttonLink} className="btn btn-primary btn-lg">
          {buttonText}
        </a>
      </div>
    </div>
  </div>
);