# PCB-M-03: CÁLCULO DE COSTO DE ENVÍO

## Módulo del sistema:

Checkout - Envío

## Historia de usuario:

HU-C03 - Como cliente quiero conocer el costo de envío basado en mi ubicación y peso de productos para planificar mi compra

## Número y nombre de la prueba:

PCB-M-03 - Cálculo de costo de envío

## Realizado por:

Valentin Alejandro Perez Zurita

## Fecha

15 de Abril del 2025

## Código Fuente

```js
/**
 * Calcula el costo de envío basado en datos reales
 * @param {Object} rule - Regla de envío
 * @param {Array} products - Productos a enviar
 * @returns {Object} - Información de costo y tiempo de entrega
 */
const calculateShippingDetails = (rule, products) => {
  if (!rule || !products || products.length === 0) {
    return { cost: 0, minDays: null, maxDays: null, isFree: false };
  }
  
  // Debugging para ver toda la información de tiempos en la regla
  console.log(`🕒 ANÁLISIS DE TIEMPOS DE ENTREGA - Regla ID: ${rule.id}`);
  console.log(`- tiempo_minimo: ${rule.tiempo_minimo}`);
  console.log(`- min_days: ${rule.min_days}`);
  console.log(`- tiempo_maximo: ${rule.tiempo_maximo}`);
  console.log(`- max_days: ${rule.max_days}`);
  
  // Calcular subtotal para validar envío gratis por monto mínimo
  const subtotal = products.reduce((sum, item) => {
    const product = item.product || item;
    const price = parseFloat(product.price || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    return sum + (price * quantity);
  }, 0);
  
  // Por defecto, tomar datos de la regla
  let cost = parseFloat(rule.precio_base || rule.base_price || 0);
  let isFree = rule.envio_gratis === true || rule.free_shipping === true;
  
  // Calcular peso total de los productos
  const pesoTotal = products.reduce((sum, product) => {
    return sum + parseFloat(product.weight || 0);
  }, 0);
  
  // Aplicar reglas de configuración de paquetes si existen
  if (rule.configuracion_paquetes) {
    const config = rule.configuracion_paquetes;
  
    // Verificar si aplica cargo por peso extra
    if (config.peso_maximo_paquete !== undefined && config.costo_por_kg_extra !== undefined) {
      const pesoMaximo = parseFloat(config.peso_maximo_paquete);
      const costoPorKgExtra = parseFloat(config.costo_por_kg_extra);
    
      if (!isNaN(pesoMaximo) && !isNaN(costoPorKgExtra) && pesoTotal > pesoMaximo) {
        const pesoExtra = pesoTotal - pesoMaximo;
        const costoExtra = pesoExtra * costoPorKgExtra;
      
        console.log(`📦 Cargo por peso extra: ${pesoExtra.toFixed(2)}kg x ${costoPorKgExtra}$ = ${costoExtra.toFixed(2)}$`);
        cost += costoExtra;
      }
    }
  
    // Verificar si aplica cargo por producto extra
    if (config.maximo_productos_por_paquete !== undefined && config.costo_por_producto_extra !== undefined) {
      const maxProductos = parseInt(config.maximo_productos_por_paquete, 10);
      const costoPorProductoExtra = parseFloat(config.costo_por_producto_extra);
    
      if (!isNaN(maxProductos) && !isNaN(costoPorProductoExtra) && products.length > maxProductos) {
        const productosExtra = products.length - maxProductos;
        const costoExtra = productosExtra * costoPorProductoExtra;
      
        console.log(`📦 Cargo por productos extra: ${productosExtra} x ${costoPorProductoExtra}$ = ${costoExtra.toFixed(2)}$`);
        cost += costoExtra;
      }
    }
  }
  
  // Leer los tiempos de entrega SOLO de la regla sin valores por defecto
  let minDays = null;
  let maxDays = null;
  
  // Intentar obtener valores de tiempo de entrega directamente de la regla
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
  
  // Si tiene opciones de mensajería, usar datos de la opción preferida
  if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
    // Log para opciones de mensajería
    console.log(`- Opciones de mensajería: ${rule.opciones_mensajeria.length}`);
    rule.opciones_mensajeria.forEach((opcion, index) => {
      console.log(`  Opción #${index+1}: ${JSON.stringify(opcion)}`);
      console.log(`  - tiempo_minimo: ${opcion.tiempo_minimo}`);
      console.log(`  - min_days: ${opcion.min_days}`);
      console.log(`  - minDays: ${opcion.minDays}`);
      console.log(`  - tiempo_maximo: ${opcion.tiempo_maximo}`);
      console.log(`  - max_days: ${opcion.max_days}`);
      console.log(`  - maxDays: ${opcion.maxDays}`);
      console.log(`  - tiempo_entrega: ${opcion.tiempo_entrega}`);
    });
  
    // Ordenar por precio para obtener la más económica
    const sortedOptions = [...rule.opciones_mensajeria].sort((a, b) => 
      parseFloat(a.precio || 0) - parseFloat(b.precio || 0)
    );
  
    const bestOption = sortedOptions[0];
    cost = parseFloat(bestOption.precio || 0);
  
    // Aplicar reglas de configuración de paquetes para la opción de mensajería
    if (bestOption.configuracion_paquetes) {
      const config = bestOption.configuracion_paquetes;
    
      // Verificar si aplica cargo por peso extra
      if (config.peso_maximo_paquete !== undefined && config.costo_por_kg_extra !== undefined) {
        const pesoMaximo = parseFloat(config.peso_maximo_paquete);
        const costoPorKgExtra = parseFloat(config.costo_por_kg_extra);
      
        if (!isNaN(pesoMaximo) && !isNaN(costoPorKgExtra) && pesoTotal > pesoMaximo) {
          const pesoExtra = pesoTotal - pesoMaximo;
          const costoExtra = pesoExtra * costoPorKgExtra;
        
          console.log(`📦 [Opción] Cargo por peso extra: ${pesoExtra.toFixed(2)}kg x ${costoPorKgExtra}$ = ${costoExtra.toFixed(2)}$`);
          cost += costoExtra;
        }
      }
    
      // Verificar si aplica cargo por producto extra
      if (config.maximo_productos_por_paquete !== undefined && config.costo_por_producto_extra !== undefined) {
        const maxProductos = parseInt(config.maximo_productos_por_paquete, 10);
        const costoPorProductoExtra = parseFloat(config.costo_por_producto_extra);
      
        if (!isNaN(maxProductos) && !isNaN(costoPorProductoExtra) && products.length > maxProductos) {
          const productosExtra = products.length - maxProductos;
          const costoExtra = productosExtra * costoPorProductoExtra;
        
          console.log(`📦 [Opción] Cargo por productos extra: ${productosExtra} x ${costoPorProductoExtra}$ = ${costoExtra.toFixed(2)}$`);
          cost += costoExtra;
        }
      }
    }
  
    // Actualizar tiempos solo si están definidos en la opción
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
  
    // Extraer tiempos desde el campo tiempo_entrega (formato "1-3 días")
    if ((minDays === null || maxDays === null) && bestOption.tiempo_entrega) {
      const tiempoMatch = bestOption.tiempo_entrega.match(/(\d+)[-\s]*(\d+)/);
      if (tiempoMatch && tiempoMatch.length >= 3) {
        if (minDays === null) minDays = parseInt(tiempoMatch[1], 10);
        if (maxDays === null) maxDays = parseInt(tiempoMatch[2], 10);
        console.log(`  - Extraídos de tiempo_entrega: min=${minDays}, max=${maxDays}`);
      } else if (bestOption.tiempo_entrega.match(/(\d+)/)) {
        // Si solo hay un número (ej: "2 días")
        const singleMatch = bestOption.tiempo_entrega.match(/(\d+)/);
        const days = parseInt(singleMatch[1], 10);
        if (minDays === null) minDays = days;
        if (maxDays === null) maxDays = days;
        console.log(`  - Extraído de tiempo_entrega (valor único): ${days} días`);
      }
    }
  }
  
  // Verificar si aplica envío gratis por monto mínimo
  if (!isFree && rule.envio_gratis_monto_minimo && subtotal >= parseFloat(rule.envio_gratis_monto_minimo)) {
    isFree = true;
  }
  
  // Si es gratis, costo cero
  if (isFree) {
    cost = 0;
  }
  
  // Asegurar que maxDays nunca sea menor que minDays si ambos existen
  if (minDays !== null && maxDays !== null && maxDays < minDays) {
    maxDays = minDays;
  }
  
  // Imprimir los valores finales para debugging
  console.log(`🕒 RESULTADO DE TIEMPOS - Regla ID: ${rule.id}`);
  console.log(`- minDays: ${minDays}`);
  console.log(`- maxDays: ${maxDays}`);
  console.log(`💰 Costo final calculado: ${cost}`);
  
  return {
    cost,
    minDays,
    maxDays,
    isFree
  };
};
```

## Diagrama de flujo∂

```plantuml
@startuml
!theme plain
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam ArrowFontSize 11

start
note right
  Función calculateShippingDetails
  Calcula el costo de envío según regla y productos
end note

' 1 - Decisión 1
if (¿rule y products válidos?) then (No)
  ' 2
  :2. Retornar valores por defecto;
  note right: { cost: 0, minDays: null, maxDays: null, isFree: false }
  stop
endif

' 3
:3. Calcular subtotal de productos;
note right
  subtotal = suma de (precio * cantidad) de cada producto
end note

' 4
:4. Inicializar cost y isFree;
note right
  cost = precio_base de la regla
  isFree = envío gratuito configurado en la regla
end note

' 5
:5. Calcular peso total de productos;

' 6 - Decisión 2
if (¿Existe configuración de paquetes?) then (Sí)
  ' 7 - Decisión 3
  if (¿Hay peso máximo y costo por kg extra?) then (Sí)
    ' 8 - Decisión 4
    if (¿Peso total > peso máximo?) then (Sí)
      ' 9
      :9. Calcular costo extra por peso;
      :10. Añadir costo extra al costo base;
    endif
  endif
  
  ' 11 - Decisión 5
  if (¿Hay máximo de productos y costo por producto extra?) then (Sí)
    ' 12 - Decisión 6
    if (¿Cantidad de productos > máximo?) then (Sí)
      ' 13
      :13. Calcular costo extra por productos;
      :14. Añadir costo extra al costo base;
    endif
  endif
endif

' 15
:15. Obtener tiempos de entrega de la regla;

' 16 - Decisión 7
if (¿Existen opciones de mensajería?) then (Sí)
  ' 17
  :17. Ordenar opciones por precio;
  :18. Seleccionar opción más económica;
  :19. Actualizar cost con precio de la opción;
  
  ' 20 - Decisión 8
  if (¿Opción tiene configuración de paquetes?) then (Sí)
    ' 21 - Decisión 9
    if (¿Hay peso máximo y costo por kg extra?) then (Sí)
      ' 22 - Decisión 10
      if (¿Peso total > peso máximo?) then (Sí)
        ' 23
        :23. Calcular costo extra por peso;
        :24. Añadir costo extra al costo base;
      endif
    endif
  
    ' 25 - Decisión 11
    if (¿Hay máximo de productos y costo por producto extra?) then (Sí)
      ' 26 - Decisión 12
      if (¿Cantidad de productos > máximo?) then (Sí)
        ' 27
        :27. Calcular costo extra por productos;
        :28. Añadir costo extra al costo base;
      endif
    endif
  endif
  
  ' 29
  :29. Actualizar tiempos de entrega con valores de la opción;
endif

' 30 - Decisión 13
if (¿Aplica envío gratis por monto mínimo?) then (Sí)
  ' 31 - Decisión 14
  if (¿subtotal >= monto mínimo?) then (Sí)
    ' 32
    :32. Establecer isFree = true;
  endif
endif

' 33 - Decisión 15
if (¿isFree es true?) then (Sí)
  ' 34
  :34. Establecer cost = 0;
endif

' 35
:35. Normalizar valores de tiempos de entrega;

' 36
:36. Retornar { cost, minDays, maxDays, isFree };
stop

@enduml
```

## Cálculo de la Complejidad Ciclomática

**Número de regiones:**

- Regiones: 8

**Fórmula Aristas - Nodos + 2**

- Nodos: 36
- Aristas: 42
- Cálculo: V(G) = 42 - 36 + 2 = 8

**Nodos predicado + 1**

- Nodos predicado (decisiones): 7
  1. ¿rule y products válidos? (Nodo 1)
  2. ¿Existe configuración de paquetes? (Nodo 6)
  3. ¿Hay peso máximo y costo por kg extra? (para regla) (Nodo 7)
  4. ¿Peso total > peso máximo? (para regla) (Nodo 8)
  5. ¿Hay máximo de productos y costo por producto extra? (para regla) (Nodo 11)
  6. ¿Cantidad de productos > máximo? (para regla) (Nodo 12)
  7. ¿Existen opciones de mensajería? (Nodo 16)
  8. ¿Opción tiene configuración de paquetes? (Nodo 20)
  9. ¿Hay peso máximo y costo por kg extra? (para opción) (Nodo 21)
  10. ¿Peso total > peso máximo? (para opción) (Nodo 22)
  11. ¿Hay máximo de productos y costo por producto extra? (para opción) (Nodo 25)
  12. ¿Cantidad de productos > máximo? (para opción) (Nodo 26)
  13. ¿Aplica envío gratis por monto mínimo? (Nodo 30)
  14. ¿subtotal >= monto mínimo? (Nodo 31)
  15. ¿isFree es true? (Nodo 33)
- Cálculo: V(G) = 7 + 1 = 8

**Conclusión:** La complejidad ciclomática es 8, lo que implica que se deben identificar 8 caminos independientes dentro del grafo.

## Determinación del Conjunto Básico de Caminos Independientes

| Nº | Descripción                                           | Secuencia de nodos                                                                                                                                                                  |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Regla o productos inválidos                           | 1(No) → 2 → Fin                                                                                                                                                                   |
| 2   | Envío gratis configurado en regla                     | 1(Sí) → 3 → 4(isFree=true) → 5 → 6(No) → 15 → 16(No) → 30(No) → 33(Sí) → 34 → 35 → 36 → Fin                                                                           |
| 3   | Regla con cargo por peso extra excedido                | 1(Sí) → 3 → 4(isFree=false) → 5 → 6(Sí) → 7(Sí) → 8(Sí) → 9 → 10 → 11(No) → 15 → 16(No) → 30(No) → 33(No) → 35 → 36 → Fin                                       |
| 4   | Regla con cargo por productos extra excedidos          | 1(Sí) → 3 → 4(isFree=false) → 5 → 6(Sí) → 7(No) → 11(Sí) → 12(Sí) → 13 → 14 → 15 → 16(No) → 30(No) → 33(No) → 35 → 36 → Fin                                     |
| 5   | Regla con opción de mensajería sin sobrecargos       | 1(Sí) → 3 → 4(isFree=false) → 5 → 6(No) → 15 → 16(Sí) → 17 → 18 → 19 → 20(No) → 29 → 30(No) → 33(No) → 35 → 36 → Fin                                              |
| 6   | Regla con opción de mensajería y peso excedido       | 1(Sí) → 3 → 4(isFree=false) → 5 → 6(No) → 15 → 16(Sí) → 17 → 18 → 19 → 20(Sí) → 21(Sí) → 22(Sí) → 23 → 24 → 25(No) → 29 → 30(No) → 33(No) → 35 → 36 → Fin |
| 7   | Regla con opción de mensajería y productos excedidos | 1(Sí) → 3 → 4(isFree=false) → 5 → 6(No) → 15 → 16(Sí) → 17 → 18 → 19 → 20(Sí) → 21(No) → 25(Sí) → 26(Sí) → 27 → 28 → 29 → 30(No) → 33(No) → 35 → 36 → Fin |
| 8   | Envío gratis por monto mínimo                        | 1(Sí) → 3 → 4(isFree=false) → 5 → 6(No) → 15 → 16(No) → 30(Sí) → 31(Sí) → 32 → 33(Sí) → 34 → 35 → 36 → Fin                                                        |

## Derivación de Casos de Prueba

| Camino | Caso de Prueba                                         | Datos de Entrada                                                                                                                                                                                                                                                   | Resultado Esperado                                                                            |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 1      | Regla o productos inválidos                           | rule = null, products = []                                                                                                                                                                                                                                         | { cost: 0, minDays: null, maxDays: null, isFree: false }                                      |
| 2      | Envío gratis configurado en regla                     | rule = { id: 1, envio_gratis: true, precio_base: 100 }, products = [{ product: { price: 200, weight: 1 }, quantity: 1 }]                                                                                                                                           | { cost: 0, minDays: null, maxDays: null, isFree: true }                                       |
| 3      | Regla con cargo por peso extra excedido                | rule = { id: 2, precio_base: 150, configuracion_paquetes: { peso_maximo_paquete: 5, costo_por_kg_extra: 30 } }, products = [{ product: { price: 500, weight: 7 }, quantity: 1 }]                                                                                   | { cost: 210, minDays: null, maxDays: null, isFree: false } (150 + (7-5)*30 = 210)             |
| 4      | Regla con cargo por productos extra excedidos          | rule = { id: 3, precio_base: 120, configuracion_paquetes: { maximo_productos_por_paquete: 2, costo_por_producto_extra: 40 } }, products = [{ price: 100, weight: 1 }, { price: 200, weight: 1 }, { price: 300, weight: 1 }, { price: 400, weight: 1 }]             | { cost: 200, minDays: null, maxDays: null, isFree: false } (120 + (4-2)*40 = 200)             |
| 5      | Regla con opción de mensajería sin sobrecargos       | rule = { id: 4, precio_base: 200, opciones_mensajeria: [{ precio: 80, tiempo_minimo: 2, tiempo_maximo: 5 }, { precio: 150, tiempo_minimo: 1, tiempo_maximo: 2 }] }, products = [{ product: { price: 300, weight: 2 }, quantity: 1 }]                               | { cost: 80, minDays: 2, maxDays: 5, isFree: false }                                           |
| 6      | Regla con opción de mensajería y peso excedido       | rule = { id: 5, precio_base: 100, opciones_mensajeria: [{ precio: 90, configuracion_paquetes: { peso_maximo_paquete: 3, costo_por_kg_extra: 25 } }] }, products = [{ product: { price: 250, weight: 5 }, quantity: 1 }]                                            | { cost: 140, minDays: null, maxDays: null, isFree: false } (90 + (5-3)*25 = 140)              |
| 7      | Regla con opción de mensajería y productos excedidos | rule = { id: 6, precio_base: 100, opciones_mensajeria: [{ precio: 95, configuracion_paquetes: { maximo_productos_por_paquete: 1, costo_por_producto_extra: 35 } }] }, products = [{ price: 200, weight: 1 }, { price: 300, weight: 1 }, { price: 350, weight: 1 }] | { cost: 165, minDays: null, maxDays: null, isFree: false } (95 + (3-1)*35 = 165)              |
| 8      | Envío gratis por monto mínimo                        | rule = { id: 7, precio_base: 180, envio_gratis_monto_minimo: 1000 }, products = [{ product: { price: 600, weight: 2 }, quantity: 2 }]                                                                                                                              | { cost: 0, minDays: null, maxDays: null, isFree: true } (subtotal 1200 >= monto mínimo 1000) |
