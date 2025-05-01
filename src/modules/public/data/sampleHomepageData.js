// Datos de muestra para usar como fallback en HomePage cuando no hay datos reales.

// Imágenes de muestra para secciones de carrusel (OurFarmSection).
export const sampleImages = [
  { id: 1, src: '/public/images/placeholder.jpg', alt: 'Farm 1' },
  { id: 2, src: '/public/images/placeholder.jpg', alt: 'Farm 2' },
  { id: 3, src: '/public/images/placeholder.jpg', alt: 'Farm 3' },
];

// Productos de muestra por si no hay productos reales.
export const sampleProducts = Array(6)
  .fill(null)
  .map((_, i) => ({
    id: `sample-product-${i + 1}`,
    name: `Producto ${i + 1}`,
    image: '/public/images/placeholder.jpg',
    price: 25 + i,
    category: 'Muestra',
  }));

// Categorías de muestra por si no hay categorías reales.
export const sampleCategories = Array(6)
  .fill(null)
  .map((_, i) => ({
    id: `sample-category-${i + 1}`,
    name: `Categoría ${i + 1}`,
    image: '/public/images/placeholder.jpg',
  })); 