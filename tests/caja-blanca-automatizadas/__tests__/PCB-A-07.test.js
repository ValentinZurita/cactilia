// PCB-A-07: Test Automatizado - Cálculo de Reglas de Envío

// Implementación de la función calculateShippingDetails
const calculateShippingDetails = (rule, products) => {
  // Caso 1: Manejar parámetros inválidos
  if (!rule || !products || !Array.isArray(products) || products.length === 0) {
    return {
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: false
    };
  }

  // Inicializar variables
  let cost = rule.precio_base || 0;
  let minDays = rule.tiempo_minimo || null;
  let maxDays = rule.tiempo_maximo || null;
  let isFree = false;

  // Si maxDays es menor que minDays, ajustar maxDays para que sea igual a minDays
  if (minDays !== null && maxDays !== null && maxDays < minDays) {
    maxDays = minDays;
  }

  // Calcular el precio total de los productos para reglas de envío gratuito
  const totalPrice = products.reduce((sum, product) => sum + (product.price || 0), 0);

  // Verificar si aplica envío gratis
  if (rule.envio_gratis || (rule.envio_gratis_monto_minimo && totalPrice >= rule.envio_gratis_monto_minimo)) {
    return {
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: true
    };
  }

  // Procesar opciones de mensajería
  if (rule.opciones_mensajeria && Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
    // Encontrar la opción más económica
    let bestOption = rule.opciones_mensajeria.reduce((prev, curr) => {
      return (prev.precio < curr.precio) ? prev : curr;
    }, rule.opciones_mensajeria[0]);

    cost = bestOption.precio;
    minDays = bestOption.minDays || null;
    maxDays = bestOption.maxDays || null;

    // Aplicar cargos adicionales por peso o productos según la configuración de la mensajería
    if (bestOption.configuracion_paquetes) {
      cost = calculateAdditionalCosts(bestOption.configuracion_paquetes, products, cost);
    }
  } else if (rule.configuracion_paquetes) {
    // Si no hay opciones de mensajería pero sí hay configuración de paquetes
    cost = calculateAdditionalCosts(rule.configuracion_paquetes, products, cost);
  }

  return {
    cost,
    minDays,
    maxDays,
    isFree
  };
};

// Función auxiliar para calcular costos adicionales por peso o productos
const calculateAdditionalCosts = (packageConfig, products, baseCost) => {
  let cost = baseCost;
  
  // Calcular peso total
  const totalWeight = products.reduce((sum, product) => sum + (product.weight || 0), 0);
  
  // Calcular cargo por peso extra
  if (packageConfig.peso_maximo_paquete && packageConfig.costo_por_kg_extra) {
    const extraWeight = Math.max(0, totalWeight - packageConfig.peso_maximo_paquete);
    if (extraWeight > 0) {
      cost += extraWeight * packageConfig.costo_por_kg_extra;
    }
  }
  
  // Calcular cargo por productos extra
  if (packageConfig.maximo_productos_por_paquete && packageConfig.costo_por_producto_extra) {
    const extraProducts = Math.max(0, products.length - packageConfig.maximo_productos_por_paquete);
    if (extraProducts > 0) {
      cost += extraProducts * packageConfig.costo_por_producto_extra;
    }
  }
  
  return cost;
};

describe('PCB-A-07: Cálculo de Reglas de Envío', () => {
  // Caso 1: Parámetros inválidos
  test('1. Debería manejar parámetros inválidos', () => {
    expect(calculateShippingDetails(null, [])).toEqual({
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: false
    });
    
    expect(calculateShippingDetails({}, null)).toEqual({
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: false
    });
    
    expect(calculateShippingDetails({}, [])).toEqual({
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: false
    });
  });

  // Caso 2: Sin configuraciones adicionales
  test('2. Debería calcular el costo base sin configuraciones adicionales', () => {
    const rule = { precio_base: 100 };
    const products = [{ price: 100, weight: 1 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 100,
      minDays: null,
      maxDays: null,
      isFree: false
    });
  });

  // Caso 3: Con cargo por peso extra
  test('3. Debería calcular cargo adicional por peso extra', () => {
    const rule = {
      precio_base: 100,
      configuracion_paquetes: {
        peso_maximo_paquete: 2,
        costo_por_kg_extra: 50
      }
    };
    const products = [{ price: 100, weight: 3 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 150, // 100 base + (1kg extra * 50)
      minDays: null,
      maxDays: null,
      isFree: false
    });
  });

  // Caso 4: Con cargo por productos extra
  test('4. Debería calcular cargo adicional por productos extra', () => {
    const rule = {
      precio_base: 100,
      configuracion_paquetes: {
        maximo_productos_por_paquete: 1,
        costo_por_producto_extra: 50
      }
    };
    const products = [
      { price: 100, weight: 1 },
      { price: 200, weight: 1 }
    ];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 150, // 100 base + (1 producto extra * 50)
      minDays: null,
      maxDays: null,
      isFree: false
    });
  });

  // Caso 5: Con opción de mensajería básica
  test('5. Debería usar la opción de mensajería más económica', () => {
    const rule = {
      precio_base: 150,
      opciones_mensajeria: [
        { precio: 100, minDays: 2, maxDays: 5 },
        { precio: 200, minDays: 1, maxDays: 3 }
      ]
    };
    const products = [{ price: 100, weight: 1 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 100,
      minDays: 2,
      maxDays: 5,
      isFree: false
    });
  });

  // Caso 6: Con opción de mensajería y cargo por peso
  test('6. Debería calcular cargo adicional por peso con opción de mensajería', () => {
    const rule = {
      precio_base: 150,
      opciones_mensajeria: [
        {
          precio: 100,
          configuracion_paquetes: {
            peso_maximo_paquete: 2,
            costo_por_kg_extra: 50
          }
        }
      ]
    };
    const products = [{ price: 100, weight: 3 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 150, // 100 base + (1kg extra * 50)
      minDays: null,
      maxDays: null,
      isFree: false
    });
  });

  // Caso 7: Con opción de mensajería y cargo por productos
  test('7. Debería calcular cargo adicional por productos con opción de mensajería', () => {
    const rule = {
      precio_base: 150,
      opciones_mensajeria: [
        {
          precio: 100,
          configuracion_paquetes: {
            maximo_productos_por_paquete: 1,
            costo_por_producto_extra: 50
          }
        }
      ]
    };
    const products = [
      { price: 100, weight: 1 },
      { price: 200, weight: 1 }
    ];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 150, // 100 base + (1 producto extra * 50)
      minDays: null,
      maxDays: null,
      isFree: false
    });
  });

  // Caso 8: Con envío gratis por regla
  test('8. Debería aplicar envío gratis cuando la regla lo indica', () => {
    const rule = {
      precio_base: 100,
      envio_gratis: true
    };
    const products = [{ price: 100, weight: 1 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: true
    });
  });

  // Caso 9: Con envío gratis por monto mínimo
  test('9. Debería aplicar envío gratis por monto mínimo', () => {
    const rule = {
      precio_base: 100,
      envio_gratis_monto_minimo: 500
    };
    const products = [{ price: 600, weight: 1 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: true
    });
  });

  // Caso 10: Con ajuste de maxDays
  test('10. Debería ajustar maxDays para que no sea menor que minDays', () => {
    const rule = {
      precio_base: 100,
      tiempo_minimo: 5,
      tiempo_maximo: 3
    };
    const products = [{ price: 100, weight: 1 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 100,
      minDays: 5,
      maxDays: 5, // Ajustado para ser igual a minDays
      isFree: false
    });
  });

  // Caso 11: Combinación de opciones de mensajería y envío gratis
  test('11. Debería aplicar envío gratis incluso con opciones de mensajería', () => {
    const rule = {
      precio_base: 150,
      opciones_mensajeria: [{ precio: 100 }],
      envio_gratis_monto_minimo: 500
    };
    const products = [{ price: 600, weight: 1 }];
    
    expect(calculateShippingDetails(rule, products)).toEqual({
      cost: 0,
      minDays: null,
      maxDays: null,
      isFree: true
    });
  });
});