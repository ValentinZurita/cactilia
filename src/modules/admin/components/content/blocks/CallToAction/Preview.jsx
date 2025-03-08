/**
 * Componente de vista previa para el bloque de Llamada a la Acción
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {boolean} [props.isPreview=true] - Si es una vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const CallToActionPreview = ({ block, isPreview = true }) => {
  // Valores por defecto
  const defaults = {
    title: 'Título de Llamada a la Acción',
    subtitle: 'Subtítulo descriptivo para incentivar a los usuarios',
    buttonText: 'Botón de Acción',
    buttonLink: '#',
    alignment: 'center'
  };

  return (
    <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
      <div
        className="cta-section py-5"
        style={{
          backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: !block.backgroundImage ? '#f8f9fa' : 'transparent'
        }}
      >
        <div className="container">
          <div className={`text-${block.alignment || defaults.alignment} py-5`}>
            <h2 className="mb-3">{block.title || defaults.title}</h2>
            <p className="lead mb-4">{block.subtitle || defaults.subtitle}</p>
            <button className="btn btn-primary btn-lg">
              {block.buttonText || defaults.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};