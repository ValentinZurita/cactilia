import { HomeSection, ProductCarousel } from '../../../../../public/components/home-page/index.js'

/**
 * Componente de vista previa para el bloque de Productos Destacados
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {boolean} [props.isPreview=true] - Si es una vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const FeaturedProductsPreview = ({ block, isPreview = true }) => {
  // Valores por defecto
  const defaults = {
    title: 'Productos Destacados',
    subtitle: 'Explora nuestra selección especial',
    icon: 'bi-star-fill',
    showBg: false,
    maxProducts: 6
  };

  // Productos de ejemplo para la vista previa
  const sampleProducts = Array(block.maxProducts || defaults.maxProducts).fill({
    id: 'preview',
    name: 'Producto Ejemplo',
    image: '/public/images/placeholder.jpg',
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
        <ProductCarousel products={sampleProducts} />
      </HomeSection>
    </div>
  );
};