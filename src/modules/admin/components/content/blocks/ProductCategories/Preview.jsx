import { HomeSection, ProductCarousel } from '../../../../../public/components/home-page/index.js'

/**
 * Componente de vista previa para el bloque de Categorías de Productos
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {boolean} [props.isPreview=true] - Si es una vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const ProductCategoriesPreview = ({ block, isPreview = true }) => {
  // Valores por defecto
  const defaults = {
    title: 'Categorías de Productos',
    subtitle: 'Explora nuestras categorías de productos',
    icon: 'bi-grid-fill',
    showBg: false
  };

  // Categorías de ejemplo para la vista previa
  const sampleCategories = Array(4).fill({
    id: 'preview',
    name: 'Categoría Ejemplo',
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
        <ProductCarousel products={sampleCategories} />
      </HomeSection>
    </div>
  );
};