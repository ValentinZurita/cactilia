# Documentación del Módulo de Envíos (Shipping Module)

## Introducción

Este documento describe la estructura de componentes refactorizada para el módulo de gestión de reglas de envío, ubicado en `src/modules/admin/components/shipping/`.

El objetivo de la refactorización fue mejorar la claridad, mantenibilidad y reutilización del código, siguiendo principios de Clean Code y adoptando un modelo de Componentes Contenedores y Componentes Presentacionales.

## Estructura de Carpetas

La estructura actual dentro de `src/modules/admin/components/shipping/` es:

```
shipping/
├── components/      # Componentes de UI genéricos/reutilizables
│   ├── ActionButton.jsx
│   ├── ActionButtonsContainer.jsx
│   ├── BackButton.jsx
│   ├── CreateButton.jsx
│   ├── EmptyState.jsx
│   ├── LoadingIndicator.jsx
│   ├── PageHeader.jsx
│   ├── PageTitle.jsx
│   ├── RuleStatusBadge.jsx
│   ├── SearchBar.jsx
│   └── ShippingMethodsSummary.jsx
├── containers/      # Componentes contenedores (con lógica y estado)
│   ├── ShippingFormContainer.jsx
│   └── ShippingTableContainer.jsx
├── form/            # Componentes específicos del formulario (presentación)
│   └── ShippingForm.jsx
├── hooks/           # Hooks personalizados
│   └── useShippingRules.js
├── importer/        # (Existente) Lógica de importación
│   └── ...
├── pages/           # Componente de página principal/enrutador
│   └── ShippingManagementPage.jsx
├── services/        # Lógica de interacción con Firebase/API
│   └── shippingService.js
├── table/           # Componentes específicos de la tabla (presentación)
│   ├── RuleTableRow.jsx
│   ├── RulesTableData.jsx
│   └── ShippingTable.jsx
└── utils/           # Utilidades (mapeo de datos)
    └── shippingDataMapper.js
```

## Descripción de Componentes Clave

### Página Principal (`pages/`)

*   **`ShippingManagementPage.jsx`**: 
    *   Responsabilidad: Punto de entrada principal. Actúa como enrutador visual.
    *   Renderiza el `PageHeader`.
    *   Renderiza condicionalmente `ShippingTableContainer` (vista de lista) o `ShippingFormContainer` (vista de crear/editar) basado en los parámetros de la URL (`mode`, `id`).
    *   Maneja la navegación principal (ir a crear, ir a editar, volver a la lista).

### Contenedores (`containers/`)

*   **`ShippingTableContainer.jsx`**: 
    *   Responsabilidad: Orquesta la vista de la tabla de reglas.
    *   Obtiene todas las reglas de envío usando `useShippingRules`.
    *   Maneja el estado y la lógica de la búsqueda/filtrado.
    *   Maneja la lógica de eliminación (llamando al servicio).
    *   Renderiza la barra de búsqueda (`SearchBar`) y la tabla (`ShippingTable`).
    *   Renderiza el botón flotante de creación (`CreateButton` en modo FAB).
*   **`ShippingFormContainer.jsx`**: 
    *   Responsabilidad: Orquesta la vista del formulario (creación/edición).
    *   Obtiene los datos de una regla específica (en modo edición) usando `useShippingRules`.
    *   Maneja el estado de carga y envío del formulario.
    *   Realiza la adaptación de datos entre el formato del formulario y el del servicio usando `shippingDataMapper.js`.
    *   Maneja la lógica de guardado (crear/actualizar) llamando a los servicios correspondientes.
    *   Renderiza el componente presentacional `ShippingForm.jsx`.

### Componentes de Tabla (`table/`)

*   **`ShippingTable.jsx`**: 
    *   Responsabilidad: Componente presentacional principal de la tabla.
    *   Maneja la renderización condicional de los diferentes estados visuales: carga (`LoadingIndicator`), estado vacío por búsqueda (`EmptyState`), tabla con datos (`RulesTableData`), estado vacío inicial (`EmptyState`).
*   **`RulesTableData.jsx`**: 
    *   Responsabilidad: Renderiza la estructura HTML `<table>` con su cabecera (`<thead>`).
    *   Mapea el array de `rules` y renderiza un `RuleTableRow` para cada una.
*   **`RuleTableRow.jsx`**: 
    *   Responsabilidad: Renderiza una única fila (`<tr>`) de la tabla.
    *   Muestra los datos de una regla en sus celdas (`<td>`).
    *   Utiliza componentes más pequeños como `ShippingMethodsSummary`, `RuleStatusBadge` y `ActionButtonsContainer` para partes específicas de la fila.

### Componentes de UI Reutilizables (`components/`)

Esta carpeta contiene componentes diseñados para ser genéricos y potencialmente reutilizables en otras partes de la aplicación.

*   `PageHeader.jsx`: Encabezado estándar con título y botón "Volver" opcional.
*   `PageTitle.jsx`: Renderiza un `<h3>` para el título.
*   `BackButton.jsx`: Botón "Volver" estilizado.
*   `SearchBar.jsx`: Barra de búsqueda con icono y botón de limpiar.
*   `CreateButton.jsx`: Botón de creación configurable (normal o FAB con efecto hover).
*   `LoadingIndicator.jsx`: Spinner de carga centrado.
*   `EmptyState.jsx`: Mensajes configurables para mostrar cuando no hay datos o resultados.
*   `ActionButtonsContainer.jsx`: Contenedor visual para agrupar botones de acción (`btn-group` con borde).
*   `ActionButton.jsx`: Botón de acción individual configurable (icono, tooltip, callback, confirmación, estilo).
*   `RuleStatusBadge.jsx`: Badge estilizado (Activo/Inactivo). Podría reutilizarse o adaptarse.
*   `ShippingMethodsSummary.jsx`: Muestra resumen de métodos. Específico de este módulo, pero el patrón es reutilizable.

### Utilidades (`utils/`)

*   **`shippingDataMapper.js`**: Contiene funciones puras para transformar datos entre el formato del backend/servicio y el formato del frontend/formulario.

## Componentes Altamente Reutilizables

Los siguientes componentes en la carpeta `components/` están diseñados específicamente para ser reutilizados fácilmente en otros módulos o secciones de la aplicación:

*   `PageHeader.jsx`
*   `PageTitle.jsx`
*   `BackButton.jsx`
*   `SearchBar.jsx`
*   `CreateButton.jsx`
*   `LoadingIndicator.jsx`
*   `EmptyState.jsx`
*   `ActionButtonsContainer.jsx`
*   `ActionButton.jsx`

Componentes como `RuleStatusBadge` y `ShippingMethodsSummary` son reutilizables conceptualmente, pero podrían necesitar pequeñas adaptaciones (props, textos) si se usan en contextos muy diferentes. 