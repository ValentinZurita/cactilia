/**
 * Utilidades para calcular costos de envío basados en paquetes y reglas.
 */

/**
 * Calcula el costo total para un grupo de paquetes y determina si cada paquete
 * califica para envío gratis basado en el subtotal y las reglas de envío.
 * Actualiza cada objeto de paquete en packagesInfo con los campos `subtotal`,
 * `isFree` y `packagePrice`.
 *
 * @param {Array<Object>} packagesInfo - Array de objetos de paquete (resultado de calculatePackaging).
 *                                        Se espera que cada paquete tenga un array `products`.
 * @param {Object} rule - La regla de envío completa asociada a este grupo de paquetes.
 *                       Se usan `envio_gratis_monto_minimo`, `precio_base`, `opciones_mensajeria`,
 *                       y `configuracion_paquetes`.
 * @returns {{totalOptionCost: number, updatedPackagesInfo: Array<Object>}} - El costo total calculado
 *           para todos los paquetes y el array packagesInfo actualizado con detalles de costo.
 */
export const calculateGroupCost = (packagesInfo = [], rule = {}) => {
  let totalOptionCost = 0;
  const updatedPackagesInfo = packagesInfo.map(pkg => ({ ...pkg })); // Clonar para evitar mutación

  const freeShippingMinAmount = parseFloat(rule.envio_gratis_monto_minimo);
  const ruleConfig = rule.configuracion_paquetes || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].configuracion_paquetes : {});
  const basePrice = parseFloat(rule.precio_base || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].precio : 0) || 0);
  const costPerKgExtra = ruleConfig ? parseFloat(ruleConfig.costo_por_kg_extra || 0) : 0;
  const maxWeightPerPackage = ruleConfig ? parseFloat(ruleConfig.peso_maximo_paquete) : NaN;

  updatedPackagesInfo.forEach((pkg) => {
    // Calcular subtotal del paquete (suma de precio * cantidad de productos en el paquete)
    pkg.subtotal = (pkg.products || []).reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.quantity || 1)), 0);
    
    // Determinar si el paquete es gratis basado en monto mínimo
    pkg.isFree = false;
    if (!isNaN(freeShippingMinAmount) && freeShippingMinAmount > 0 && pkg.subtotal >= freeShippingMinAmount) {
      pkg.isFree = true;
    }
    // Considerar también el flag general de la regla
    if (rule.envio_gratis === true || rule.free_shipping === true) {
        pkg.isFree = true;
    }

    // Calcular precio del paquete
    if (pkg.isFree) {
      pkg.packagePrice = 0;
    } else {
      let currentPackagePrice = basePrice;
      // Aplicar costo extra por peso si corresponde
      if (costPerKgExtra > 0 && !isNaN(maxWeightPerPackage) && pkg.weight > maxWeightPerPackage) {
        const extraWeight = pkg.weight - maxWeightPerPackage;
        // Redondear kilos extra hacia arriba
        const extraKgsRoundedUp = Math.ceil(extraWeight);
        const extraCost = extraKgsRoundedUp * costPerKgExtra;
        currentPackagePrice += extraCost;
      }
      pkg.packagePrice = currentPackagePrice;
    }
    // Sumar al costo total de la opción
    totalOptionCost += pkg.packagePrice;
  });

  // Asegurar que el costo total sea realmente 0 si todos los paquetes son gratis
  // (Podría haber casos raros con centavos residuales si no se maneja con cuidado)
  const allPackagesFree = updatedPackagesInfo.every(pkg => pkg.isFree);
  if (allPackagesFree) {
      totalOptionCost = 0;
  }

  return { totalOptionCost, updatedPackagesInfo };
}; 