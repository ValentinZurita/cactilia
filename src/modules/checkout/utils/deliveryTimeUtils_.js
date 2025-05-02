/**
 * Utilidades para calcular y formatear los tiempos de entrega basados en reglas de envío.
 */

/**
 * Extrae y calcula la información del tiempo de entrega (días mínimos, máximos y texto descriptivo)
 * a partir de una regla de envío. Busca en varios campos posibles y en las opciones de mensajería.
 *
 * @param {Object} rule - La regla de envío completa.
 * @returns {{minDays: number|null, maxDays: number|null, deliveryTimeText: string}}
 */
export const getDeliveryTimeInfo = (rule = {}) => {
  let minDays = null;
  let maxDays = null;
  let deliveryTimeText = ''; // Texto descriptivo final

  // 1. Intentar obtener min/max days directamente de la regla
  if (rule.tiempo_minimo !== undefined && rule.tiempo_minimo !== null) {
    minDays = parseInt(rule.tiempo_minimo, 10);
  } else if (rule.min_days !== undefined && rule.min_days !== null) {
    minDays = parseInt(rule.min_days, 10);
  } else if (rule.minDays !== undefined && rule.minDays !== null) {
    minDays = parseInt(rule.minDays, 10);
  }

  if (rule.tiempo_maximo !== undefined && rule.tiempo_maximo !== null) {
    maxDays = parseInt(rule.tiempo_maximo, 10);
  } else if (rule.max_days !== undefined && rule.max_days !== null) {
    maxDays = parseInt(rule.max_days, 10);
  } else if (rule.maxDays !== undefined && rule.maxDays !== null) {
    maxDays = parseInt(rule.maxDays, 10);
  }

  // 2. Si tiene opciones de mensajería, intentar obtener info de la primera (preferida/más barata)
  if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
    const bestOption = rule.opciones_mensajeria[0]; // Asume que la primera es la relevante

    // Sobrescribir min/max days solo si están definidos en la opción
    if (bestOption.tiempo_minimo !== undefined && bestOption.tiempo_minimo !== null) {
      minDays = parseInt(bestOption.tiempo_minimo, 10);
    } else if (bestOption.min_days !== undefined && bestOption.min_days !== null) {
      minDays = parseInt(bestOption.min_days, 10);
    } else if (bestOption.minDays !== undefined && bestOption.minDays !== null) {
      minDays = parseInt(bestOption.minDays, 10);
    }

    if (bestOption.tiempo_maximo !== undefined && bestOption.tiempo_maximo !== null) {
      maxDays = parseInt(bestOption.tiempo_maximo, 10);
    } else if (bestOption.max_days !== undefined && bestOption.max_days !== null) {
      maxDays = parseInt(bestOption.max_days, 10);
    } else if (bestOption.maxDays !== undefined && bestOption.maxDays !== null) {
      maxDays = parseInt(bestOption.maxDays, 10);
    }

    // Usar tiempo_entrega como texto descriptivo si existe
    if (bestOption.tiempo_entrega) {
      deliveryTimeText = bestOption.tiempo_entrega;
      // Si no teníamos min/max days, intentar extraerlos del texto
      if ((minDays === null || maxDays === null)) {
        const tiempoMatch = bestOption.tiempo_entrega.match(/(\d+)[-\s]*(\d+)/);
        if (tiempoMatch && tiempoMatch.length >= 3) {
          if (minDays === null) minDays = parseInt(tiempoMatch[1], 10);
          if (maxDays === null) maxDays = parseInt(tiempoMatch[2], 10);
        } else {
            const singleMatch = bestOption.tiempo_entrega.match(/(\d+)/);
            if (singleMatch && singleMatch.length >= 2) {
                const days = parseInt(singleMatch[1], 10);
                if (!isNaN(days)) {
                    if (minDays === null) minDays = days;
                    if (maxDays === null) maxDays = days;
                }
            }
        }
      }
    }
  }
  
  // 3. Si no se obtuvo texto de tiempo_entrega, construirlo a partir de min/max days
  if (!deliveryTimeText && minDays !== null && maxDays !== null) {
    // Asegurar que maxDays >= minDays
    if (maxDays < minDays) maxDays = minDays;
    
    if (minDays === maxDays) {
      deliveryTimeText = minDays === 1 ? `Entrega en 1 día hábil` : `Entrega en ${minDays} días hábiles`;
    } else {
      deliveryTimeText = `Entrega en ${minDays}-${maxDays} días hábiles`;
    }
  }
  
  // Validar que minDays y maxDays sean números válidos o null
  minDays = (minDays !== null && !isNaN(minDays)) ? minDays : null;
  maxDays = (maxDays !== null && !isNaN(maxDays)) ? maxDays : null;

  return { minDays, maxDays, deliveryTimeText };
}; 