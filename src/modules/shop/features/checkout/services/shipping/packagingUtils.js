/**
 * Utilidades para calcular el empaquetado de productos según reglas de envío.
 */

/**
 * Calcula cómo se deben dividir los productos en paquetes según las restricciones
 * de la configuración de la regla de envío (peso máximo o cantidad máxima).
 *
 * @param {Array} products - Array de objetos de producto para agrupar.
 * @param {Object} ruleConfig - Objeto de configuración del paquete (usualmente rule.configuracion_paquetes).
 *                               Puede contener peso_maximo_paquete y/o maximo_productos_por_paquete.
 * @param {string} basePackageId - Un ID base para generar los IDs de los paquetes (ej. group.id).
 * @returns {{packagesCount: number, packagesInfo: Array<Object>}} - El número de paquetes y un array con la información detallada de cada paquete (productos, peso, etc.).
 */
export const calculatePackaging = (products = [], ruleConfig = {}, basePackageId = 'group') => {
  let packagesCount = 1;
  let packagesInfo = [];
  const hasPackageConfig = !!ruleConfig;
  const maxProductsPerPackage = hasPackageConfig ? parseInt(ruleConfig.maximo_productos_por_paquete, 10) : NaN;
  const maxWeightPerPackage = hasPackageConfig ? parseFloat(ruleConfig.peso_maximo_paquete) : NaN;

  // Caso 1: Dividir por máximo de productos por paquete
  if (!isNaN(maxProductsPerPackage) && maxProductsPerPackage > 0 && products.length > maxProductsPerPackage) {
    packagesCount = Math.ceil(products.length / maxProductsPerPackage);
    for (let i = 0; i < packagesCount; i++) {
      const startIdx = i * maxProductsPerPackage;
      const endIdx = Math.min(startIdx + maxProductsPerPackage, products.length);
      const packageProducts = products.slice(startIdx, endIdx);
      packagesInfo.push({
        id: `pkg_${basePackageId}_${i + 1}`,
        products: packageProducts,
        productCount: packageProducts.length,
        weight: packageProducts.reduce((sum, p) => sum + parseFloat(p.weight || 0) * (p.quantity || 1), 0), // Considerar cantidad
      });
    }
  }
  // Caso 2: Dividir por peso máximo por paquete (solo si no se dividió por productos)
  else if (!isNaN(maxWeightPerPackage) && maxWeightPerPackage > 0) {
    let currentPackageProducts = [];
    let currentPackageWeight = 0;
    packagesInfo = []; // Reiniciar por si acaso

    for (const product of products) {
      const productWeight = parseFloat(product.weight || 0) * (product.quantity || 1); // Considerar cantidad
      
      // Si añadir este producto excede el peso MÁXIMO y el paquete actual NO está vacío,
      // cerrar el paquete actual y empezar uno nuevo con este producto.
      if (currentPackageWeight + productWeight > maxWeightPerPackage && currentPackageProducts.length > 0) {
        packagesInfo.push({
          id: `pkg_${basePackageId}_${packagesInfo.length + 1}`,
          products: currentPackageProducts,
          productCount: currentPackageProducts.reduce((sum, p) => sum + (p.quantity || 1), 0),
          weight: currentPackageWeight,
        });
        // Empezar paquete nuevo
        currentPackageProducts = [product];
        currentPackageWeight = productWeight;
      }
      // Si añadir el producto NO excede el peso MÁXIMO (o el paquete actual está vacío),
      // simplemente añadirlo al paquete actual.
      else {
        currentPackageProducts.push(product);
        currentPackageWeight += productWeight;
      }
    }
    // Añadir el último paquete si contiene productos
    if (currentPackageProducts.length > 0) {
      packagesInfo.push({
        id: `pkg_${basePackageId}_${packagesInfo.length + 1}`,
        products: currentPackageProducts,
        productCount: currentPackageProducts.reduce((sum, p) => sum + (p.quantity || 1), 0),
        weight: currentPackageWeight,
      });
    }
    packagesCount = packagesInfo.length;

    // Asegurar que packagesInfo no esté vacío si solo hay un paquete
    if (packagesCount === 1 && packagesInfo.length === 0) {
         packagesInfo.push({
            id: `pkg_${basePackageId}_1`,
            products: products,
            productCount: products.reduce((sum, p) => sum + (p.quantity || 1), 0),
            weight: products.reduce((sum, p) => sum + parseFloat(p.weight || 0) * (p.quantity || 1), 0),
          });
    }
  }
  // Caso 3: Sin restricciones o no se excedieron -> un solo paquete
  else {
    packagesInfo = [{
      id: `pkg_${basePackageId}_1`,
      products: products,
      productCount: products.reduce((sum, p) => sum + (p.quantity || 1), 0),
      weight: products.reduce((sum, p) => sum + parseFloat(p.weight || 0) * (p.quantity || 1), 0),
    }];
    packagesCount = 1;
  }

  return { packagesCount, packagesInfo };
}; 