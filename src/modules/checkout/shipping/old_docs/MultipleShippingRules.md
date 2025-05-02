# Reglas de Envío Múltiples

Este documento explica la implementación del sistema de reglas de envío múltiples para productos en la plataforma Cactilia.

## Descripción General

El sistema permite asignar múltiples reglas de envío a un producto, permitiendo que un cliente pueda elegir entre diferentes opciones de envío basadas en su ubicación geográfica.

### Caso de Uso Principal

Cuando un producto está disponible tanto para entrega local como para envío nacional, un cliente puede ver ambas opciones si se encuentra en el área de entrega local. Por ejemplo:

- Un cliente en CDMX puede ver la opción de "Entrega local en CDMX" (más barata/rápida) o "Envío Nacional" si el producto tiene ambas reglas.
- Un cliente en Guadalajara solo verá la opción "Envío Nacional" si se encuentra fuera del área de entrega local.

## Arquitectura

El sistema se compone de tres partes principales:

1. **Admin - Configuración de Productos**: Permite asignar múltiples reglas de envío a cada producto
2. **Checkout - Agrupación de Productos**: Agrupa productos por reglas de envío comunes
3. **Checkout - Selección de Opciones**: Presenta las opciones disponibles y calcula costos

### Flujo de Datos

```
[ADMIN]                                [CHECKOUT]
┌─────────────┐                        ┌─────────────────────┐
│ ProductForm │                        │ ShippingGrouping    │
│ (Múltiples  │─── Firestore DB ─────▶│ Service             │──┐
│ Reglas)     │                        │ (Agrupación)        │  │
└─────────────┘                        └─────────────────────┘  │
                                                               │
                                                               ▼
                                        ┌─────────────────────┐
                                        │ ShippingGroups      │
                                        │ Calculator          │
                                        │ (Visualización)     │
                                        └─────────────────────┘
```

## Componentes Principales

### 1. shippingGroupingService.js

Este servicio maneja la lógica para:
- Agrupar productos por reglas de envío comunes
- Calcular costos
- Preparar datos para presentar al usuario

Funciones principales:
- `groupProductsByShippingRules`: Agrupa productos del carrito según reglas comunes
- `getShippingOptionsForGroup`: Obtiene opciones de envío para un grupo
- `calculateShippingCostForGroup`: Calcula costos según peso, cantidad y configuración
- `prepareShippingOptionsForCheckout`: Prepara datos consolidados para el checkout

### 2. ShippingGroupsCalculator.jsx

Este componente muestra las opciones de envío agrupadas al usuario y permite seleccionar la opción más conveniente.

Características:
- Agrupación visual de productos por opciones de envío comunes
- Cálculo automático de la opción más económica
- Visualización del desglose de costos
- Soporte para selección entre múltiples opciones

## Reglas de Cálculo de Costos

El sistema aplica las siguientes reglas:

1. **Peso**: Suma el peso de todos los productos.
   - Si el peso total es menor o igual al "Peso máximo por envío", se cobra la tarifa base
   - Si excede ese peso, se calcula el sobrepeso y se aplica el recargo usando el "Costo por kg extra"

2. **Cantidad**: Verifica el número de productos.
   - Si el número excede el "Máximo de productos por envío", se divide en varios paquetes

3. **Paquetes**: El número de paquetes se determina por:
   - `Max(paquetes por peso, paquetes por cantidad)`
   - Ejemplo: 25kg que requiere 2 paquetes por peso, pero 5 productos que caben en 1 paquete = 2 paquetes

## Ejemplos

### Ejemplo 1: Un producto con múltiples reglas

Un cliente en CDMX compra un producto que tiene dos reglas: "Entrega Local CDMX" ($50) y "Envío Nacional" ($150).
- El cliente verá ambas opciones y podrá elegir la que más le convenga.

### Ejemplo 2: Productos con diferentes reglas

Un cliente compra dos productos:
- Producto A: Tiene reglas "Entrega Local CDMX" y "Envío Nacional"
- Producto B: Solo tiene regla "Envío Nacional"

El sistema agrupará los productos en:
- Grupo 1: Producto A (con opciones "Entrega Local CDMX" o "Envío Nacional")
- Grupo 2: Producto B (con opción "Envío Nacional")

### Ejemplo 3: Cálculos de sobrepeso

Para una regla con:
- Peso máximo por envío: 20 kg
- Costo por kg extra: 10 pesos
- Máximo productos por envío: 10 unidades

Un pedido de 23 kg:
- Tarifa base: $150
- Sobrepeso: 3 kg x $10 = $30
- Costo total: $180

## Extendiendo el Sistema

### Añadir Nuevas Características

1. **Reglas dinámicas por distancia**:
   - Implementar en `shippingGroupingService.js` -> función `calculateShippingCostForGroup`

2. **Mejores algoritmos de agrupación**:
   - Modificar `groupProductsByShippingRules` para implementar lógicas más sofisticadas

3. **Opciones de envío express**:
   - Añadir campo a las opciones de mensajería y actualizar la UI

### Consideraciones Técnicas

- Mantener compatibilidad con el campo `shippingRuleId` existente
- Actualizar consultas y filtros que dependen de reglas de envío
- Asegurar que el rendimiento se mantiene con muchos productos/reglas 