import { useMemo } from 'react';

/**
 * Hook personalizado para calcular y formatear los datos de visualización
 * de un paquete de envío a partir de los datos brutos y los items del carrito.
 *
 * @param {Object} packageData - Datos del paquete (provenientes de la API o cálculo previo).
 * @param {Array} cartItems - Array completo de items en el carrito.
 * @returns {Object} Un objeto con los datos calculados y formateados para la UI.
 */
export const usePackageDisplayData = (packageData, cartItems = []) => {

  // Extraer datos necesarios de packageData
  const {
    products: productIds = [], // IDs de productos en este paquete
    price, // <-- Añadir price (costo calculado por Greedy)
    totalCost, // Mantener como posible fallback
    estimatedDelivery,
    deliveryTime,
    tiempo_entrega,
    minDays,
    maxDays,
    zoneType,
    carrier,
    rule_id,
    packagesInfo: externalPackagesInfo = [],
  } = packageData || {}; // Asegurar que packageData no sea null/undefined

  // Calcular productos filtrados para este paquete (memoizado)
  const packProducts = useMemo(() => {
    if (!productIds || productIds.length === 0 || !cartItems || cartItems.length === 0) {
      return [];
    }
    return cartItems
      .filter(item => {
        const productId = (item.product ? item.product.id : item.id);
        return productIds.includes(productId);
      })
      .map(item => {
        const product = item.product || item;
        return {
          id: product.id,
          name: product.name || product.nombre || '',
          quantity: item.quantity || 1,
          weight: product.weight || product.peso || 0,
          price: product.price || product.precio || 0,
        };
      });
  }, [productIds, cartItems]);

  // Calcular totales (memoizado)
  const { totalProductUnits, totalWeight } = useMemo(() => {
    let units = 0;
    let weight = 0;
    packProducts.forEach(product => {
      units += product.quantity;
      weight += (parseFloat(product.weight) * product.quantity);
    });
    return {
      totalProductUnits: units,
      totalWeight: weight.toFixed(2),
    };
  }, [packProducts]);

  // Obtener los paquetes a mostrar (memoizado)
  const packages = useMemo(() => {
    // Función interna (similar a getDisplayPackages anterior)
    const getPackages = () => {
      if (externalPackagesInfo && Array.isArray(externalPackagesInfo) && externalPackagesInfo.length > 0) {
        return externalPackagesInfo.map(pkg => ({
          ...pkg,
          // Mapear productos si es necesario
          products: pkg.products && pkg.products.length > 0 && typeof pkg.products[0] === 'string' ?
                    packProducts.filter(p => (pkg.products || []).includes(p.id))
                    : (pkg.products && pkg.products.length > 0 ? pkg.products : packProducts),
          price: pkg.packagePrice !== undefined ? pkg.packagePrice : 0,
        }));
      }
      // Crear un solo paquete si no hay precalculados
      return [{
          id: `pkg_${rule_id || 'default'}_1`,
          products: packProducts,
          productCount: totalProductUnits,
          weight: parseFloat(totalWeight),
          price: totalCost || 0,
        }];
    };
    return getPackages();
  }, [externalPackagesInfo, packProducts, totalProductUnits, totalWeight, rule_id, totalCost]);

  const actualPackagesCount = useMemo(() => packages.length, [packages]);

  // Calcular costo (memoizado)
  const { calculatedTotalCost, isFreeShipping, formattedTotalCost } = useMemo(() => {
    // Usar packageData.price (el calculado por Greedy) como fuente principal
    // Usar totalCost solo como fallback si price no está definido
    const cost = price !== undefined && price !== null ? price : totalCost || 0;
    const free = cost === 0;
    const formatted = free
      ? 'GRATIS'
      : new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
      }).format(cost);
    return {
      calculatedTotalCost: cost,
      isFreeShipping: free,
      formattedTotalCost: formatted,
    };
  // Depender de 'price' y 'totalCost'
  }, [price, totalCost]);

  // Calcular tiempo de entrega (memoizado)
  const displayDeliveryTime = useMemo(() => {
    let deliveryText = estimatedDelivery || deliveryTime || tiempo_entrega || '';
    if (!deliveryText && minDays !== undefined && maxDays !== undefined && minDays !== null && maxDays !== null) {
      if (minDays === maxDays) {
        deliveryText = minDays === 1 ? `1 día hábil` : `${minDays} días hábiles`;
      } else {
        deliveryText = `${minDays}-${maxDays} días hábiles`;
      }
    }
    return deliveryText;
  }, [estimatedDelivery, deliveryTime, tiempo_entrega, minDays, maxDays]);

  // Obtener icono (memoizado, aunque podría ser una función simple si no necesita memoización)
  // Depende de zoneType y carrier, que vienen de packageData
  const getShippingIcon = useMemo(() => () => {
    if (zoneType === 'local') return <i className="bi bi-house-door-fill text-success"></i>;
    if (zoneType === 'express') return <i className="bi bi-lightning-fill text-warning"></i>;
    if (carrier?.toLowerCase().includes('estafeta')) return <i className="bi bi-box-seam-fill text-danger"></i>;
    if (carrier?.toLowerCase().includes('dhl')) return <i className="bi bi-truck text-warning"></i>;
    if (zoneType === 'nacional') return <i className="bi bi-truck"></i>;
    return <i className="bi bi-box"></i>;
  }, [zoneType, carrier]);

  // Retornar todos los valores calculados
  return {
    packProducts,       // Productos filtrados para este paquete
    totalProductUnits,  // Total de unidades de producto
    totalWeight,        // Peso total formateado
    packages,           // Array de paquetes a mostrar en detalles
    actualPackagesCount,// Número de paquetes
    calculatedTotalCost,// Costo numérico
    isFreeShipping,     // Booleano si es gratis
    formattedTotalCost, // Costo formateado para mostrar
    displayDeliveryTime,// Texto del tiempo de entrega
    getShippingIcon,    // Función para obtener el JSX del icono
  };
}; 