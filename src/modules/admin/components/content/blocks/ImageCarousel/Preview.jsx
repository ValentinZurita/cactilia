import { HomeCarousel, HomeSection } from '../../../../../public/components/home-page/index.js'

/**
 * Componente de vista previa para el bloque de Carrusel de Imágenes
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {boolean} [props.isPreview=true] - Si es una vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const ImageCarouselPreview = ({ block, isPreview = true }) => {
  // Valores por defecto
  const defaults = {
    title: 'Nuestro Huerto',
    subtitle: 'Descubre la belleza y frescura de nuestra granja',
    icon: 'bi-images',
    showBg: true
  };

  // Imágenes de ejemplo para la vista previa
  const sampleImages = Array(3).fill({
    id: 'preview',
    src: '/public/images/placeholder.jpg',
    alt: 'Imagen de ejemplo'
  });

  return (
    <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
      <HomeSection
        title={block.title || defaults.title}
        subtitle={block.subtitle || defaults.subtitle}
        icon={block.icon || defaults.icon}
        showBg={block.showBg ?? defaults.showBg}
        spacing="py-4"
        height="auto"
      >
        <HomeCarousel images={sampleImages} />
      </HomeSection>
    </div>
  );
};