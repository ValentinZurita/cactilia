# Sistema de Envío - Documentación Técnica

## 📋 Descripción General

El sistema de envío de Cactilia implementa un flujo complejo para calcular opciones de envío basadas en la ubicación del cliente, disponibilidad de productos, y reglas de envío configuradas. Este documento detalla la arquitectura actual, los parches implementados para resolver problemas específicos, y sugerencias para mejoras futuras.

## 🏗️ Arquitectura Actual

### Componentes Principales

1. **NewShippingIntegration**  
   - Punto de entrada desde el checkout
   - Puente entre el sistema de checkout y el módulo de envío
   - Maneja notificaciones de cambios en costos y disponibilidad

2. **ShippingManagerForCheckout**  
   - Gestiona la interfaz de usuario de envío dentro del checkout
   - Procesa los datos de dirección del usuario
   - Comunica opciones de envío al componente padre

3. **ShippingOptions**  
   - Presenta las opciones de envío disponibles
   - Calcula y muestra productos cubiertos/no cubiertos

4. **CheckoutSummaryPanel**  
   - Procesa los datos de envío para mostrarlos en el resumen
   - Gestiona la lógica de envío gratuito y costos
   - Pasa datos formateados al CheckoutSummary

5. **CheckoutSummary**  
   - Muestra el resumen final con lista de productos
   - Separa productos disponibles y no disponibles
   - Calcula subtotales ajustados

### Flujo de Datos

```
Usuario selecciona dirección
↓
CheckoutForm → NewShippingIntegration
↓
ShippingManagerForCheckout → ShippingOptions
↓
Cálculo de opciones y cobertura
↓
Datos retornan a CheckoutContent
↓
CheckoutSummaryPanel recibe datos procesados
↓
CheckoutSummary muestra el resumen final
```

### Utilidades de Empaquetado

Las funciones en `packagingUtils.js` implementan un algoritmo "greedy" para:
- Agrupar productos en paquetes óptimos
- Calcular pesos y dimensiones
- Determinar costos por paquete
- Manejar sobrepesos y costos adicionales

## 🔄 Parches Actuales

### 1. Manejo de Información de Cobertura (NewShippingIntegration)

```javascript
// PARCHE: Nuevo ref para el último costo válido que aún no ha sido procesado
const pendingCostRef = useRef(null);
// PARCHE: Flag para indicar si se debería esperar a que llegue la información de cobertura
const waitingForCoverageRef = useRef(false);
```

**Problema:** La información de cobertura (productos disponibles/no disponibles) y los costos de envío pueden llegar en momentos diferentes, causando estados inconsistentes.

**Solución temporal:** Se implementaron refs para almacenar costos pendientes y esperar a que la información de cobertura esté disponible antes de notificar cambios.

### 2. Aseguramiento de Propiedades (CheckoutContent)

```javascript
// SOLUCIÓN FINAL: Asegurarnos de que el objeto selectedShippingOption tiene los datos correctos
const enhancedSelectedOption = selectedShippingOption ? {
  ...selectedShippingOption,
  // Asegurarnos de que estos campos siempre existan
  hasPartialCoverage: selectedShippingOption.hasPartialCoverage || selectedShippingOption.isPartial || false,
  unavailableProductIds: selectedShippingOption.unavailableProductIds || [],
  allProductsCovered: !(selectedShippingOption.hasPartialCoverage || selectedShippingOption.isPartial || false)
} : null;
```

**Problema:** Inconsistencia en las propiedades de las opciones de envío entre componentes.

**Solución temporal:** Se crea un objeto mejorado que garantiza que todas las propiedades necesarias estén presentes antes de pasarlo a los componentes descendientes.

### 3. Nombres de Propiedades Inconsistentes

**Problema:** Existen múltiples propiedades para representar el mismo concepto:
- `isFree` vs `isFreeShipping`
- `hasPartialCoverage` vs `isPartial`

**Solución temporal:** Comprobaciones redundantes para asegurar compatibilidad:

```javascript
isFree: validCost === 0,
isFreeShipping: validCost === 0,
```

### 4. Cálculos Redundantes

Los cálculos de subtotales, impuestos y totales se realizan en múltiples lugares, lo que puede llevar a inconsistencias.

## 🛠️ Sugerencias para Mejoras Futuras

### 1. Refactorización de Componentes

- **Problema:** Varios componentes superan las 100-120 líneas recomendadas por las guías de desarrollo.
- **Solución:** Dividir componentes grandes en subcomponentes más pequeños y enfocados.

```javascript
// Ejemplo: Extraer en componentes más pequeños
const ShippingCostDisplay = ({ cost, isFree }) => {
  return isFree ? (
    <span style={{ color: '#4CAF50' }}>Gratis</span>
  ) : (
    <span>{formatPrice(cost)}</span>
  );
};
```

### 2. Implementación de TypeScript

- **Problema:** Falta de interfaces claras para los datos que fluyen entre componentes.
- **Solución:** Definir interfaces para todas las estructuras de datos:

```typescript
interface ShippingOption {
  id: string;
  name: string;
  price: number;
  totalCost: number;
  calculatedCost: number;
  isFree: boolean;
  isFreeShipping: boolean;
  hasPartialCoverage: boolean;
  isPartial?: boolean;
  unavailableProductIds: string[];
  coveredProductIds: string[];
  allProductsCovered: boolean;
}
```

### 3. Unificación de Propiedades

- **Problema:** Nombres de propiedades inconsistentes.
- **Solución:** Estandarizar nombres de propiedades y actualizar todas las referencias:

```javascript
// Antes
isFree: validCost === 0,
isFreeShipping: validCost === 0,

// Después
isFreeShipping: validCost === 0,
```

### 4. Creación de Custom Hooks

- **Problema:** Lógica de envío duplicada en varios componentes.
- **Solución:** Extraer lógica común a hooks personalizados:

```javascript
// Ejemplo de hook propuesto
function useShippingCoverage(cartItems, selectedAddress) {
  const [coverageInfo, setCoverageInfo] = useState({
    coveredProductIds: [],
    unavailableProductIds: [],
    hasPartialCoverage: false
  });
  
  // Lógica para calcular cobertura...
  
  return coverageInfo;
}
```

### 5. Simplificación del Flujo de Datos

- **Problema:** El flujo de datos es complejo y tiene múltiples transformaciones.
- **Solución:** Establecer un "contrato" claro entre componentes con un formato de datos consistente.

### 6. Mejora de Logging

- **Problema:** Exceso de logs de depuración que dificultan el mantenimiento.
- **Solución:** Implementar un sistema de logging nivelado (error, warn, info, debug) que pueda activarse/desactivarse según el entorno.

```javascript
const logger = {
  error: (message, data) => console.error(`❌ ${message}`, data),
  warn: (message, data) => process.env.NODE_ENV !== 'production' && console.warn(`⚠️ ${message}`, data),
  info: (message, data) => process.env.NODE_ENV !== 'production' && console.log(`ℹ️ ${message}`, data),
  debug: (message, data) => process.env.DEBUG && console.log(`🔍 ${message}`, data),
};
```

### 7. Pruebas Unitarias

- **Problema:** Falta de pruebas automatizadas que garanticen el funcionamiento correcto.
- **Solución:** Implementar pruebas para cada función de utilidad y componente crítico.

```javascript
// Ejemplo de test para calculateItemWeight
test('calculateItemWeight returns correct weight for item', () => {
  const item = { product: { weight: 2 }, quantity: 3 };
  expect(calculateItemWeight(item)).toBe(6);
});
```

### 8. Documentación de API Interna

- **Problema:** Documentación insuficiente para desarrolladores nuevos.
- **Solución:** Mejorar JSDoc para todas las funciones y componentes críticos.

## 🚧 Plan de Implementación

1. **Fase 1: Estabilización**
   - Documentar todos los parches actuales
   - Añadir pruebas para validar el comportamiento actual
   - Reducir logs redundantes

2. **Fase 2: Refactorización**
   - Implementar TypeScript gradualmente
   - Extraer lógica a custom hooks
   - Dividir componentes grandes

3. **Fase 3: Mejoras**
   - Unificar nombres de propiedades
   - Simplificar flujo de datos
   - Mejorar UX para escenarios de envío parcial

## 📊 Métricas de Éxito

1. **Mantenibilidad**
   - Reducción de la longitud de los componentes (<120 líneas)
   - Eliminación de duplicación de código

2. **Estabilidad**
   - Reducción de bugs relacionados con envío
   - Cobertura de pruebas >80%

3. **Experiencia de Usuario**
   - Tiempo de carga reducido
   - Claridad en las opciones de envío y productos no disponibles

## 📝 Conclusión

El sistema actual de envío cumple su función pero requiere mejoras significativas para su mantenibilidad a largo plazo. Siguiendo las guías de desarrollo del proyecto y aplicando las mejoras sugeridas, se puede transformar en un sistema más modular, testeable y fácil de mantener. 