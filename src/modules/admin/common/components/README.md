# Common Admin UI Components

## Propósito

Esta carpeta (`src/modules/admin/common/components/`) contiene componentes de React diseñados para ser **reutilizables** en diferentes módulos y secciones dentro del área de administración de la aplicación.

El objetivo es promover la **consistencia visual y funcional**, reducir la duplicación de código (DRY) y facilitar el desarrollo y mantenimiento de la interfaz de usuario del administrador.

## Componentes Disponibles

A continuación se listan los componentes genéricos disponibles actualmente:

*   **`ActionButton.jsx`**: 
    *   Renderiza un botón de acción individual (generalmente con un icono).
    *   Configurable con icono, tooltip, callback `onClick`, mensaje de confirmación opcional, estilo (variante, color de texto) y efecto hover opcional para el icono.
    *   Diseñado para usarse dentro de `ActionButtonsContainer`.

*   **`ActionButtonsContainer.jsx`**: 
    *   Contenedor visual que agrupa `ActionButton`s usando Bootstrap `btn-group`.
    *   Proporciona un borde sutil y redondeado alrededor del grupo.
    *   Acepta botones como `children`.

*   **`BackButton.jsx`**: 
    *   Un simple botón "Volver" con icono de flecha izquierda.
    *   Recibe un callback `onClick`.

*   **`CreateButton.jsx`**: 
    *   Botón estándar para acciones de "Crear" o "Nuevo".
    *   Configurable con texto e icono.
    *   Puede renderizarse como un botón normal o como un Botón Flotante de Acción (FAB) circular con efecto de escalado al pasar el ratón.

*   **`DataTable.jsx`**: 
    *   Componente principal para renderizar tablas de datos genéricas.
    *   Maneja estados de carga y vacío (sin datos / sin resultados de búsqueda).
    *   Renderiza la estructura `<table>` y `<thead>` basado en una configuración de columnas.
    *   Soporta ordenación básica controlada externamente (muestra indicadores y emite evento `onSortChange`).
    *   Delega la renderización de filas a `DataTableRow`.

*   **`DataTableRow.jsx`**: 
    *   Renderiza una única fila (`<tr>`) para `DataTable`.
    *   Recibe un item de datos y la configuración de columnas.
    *   Renderiza las celdas (`<td>`) llamando a la función `renderCell` definida en la configuración de cada columna.

*   **`EmptyState.jsx`**: 
    *   Muestra un mensaje visual para indicar que no hay datos o resultados.
    *   Configurable con icono, título, mensaje y contenido `children` adicional (ej: botones).

*   **`LoadingIndicator.jsx`**: 
    *   Muestra un spinner de carga centrado con un mensaje opcional.

*   **`PageHeader.jsx`**: 
    *   Renderiza un encabezado de página estándar.
    *   Incluye un `PageTitle` y opcionalmente un `BackButton`.

*   **`PageTitle.jsx`**: 
    *   Componente simple para renderizar el título principal (`<h3>`) de una página.

*   **`SearchBar.jsx`**: 
    *   Barra de búsqueda reutilizable con icono de lupa y botón opcional para limpiar la búsqueda.
    *   Recibe el término de búsqueda actual y los callbacks para cambios y limpieza.

## Cómo Usar

Simplemente importa el componente necesario desde esta carpeta en cualquier otro componente dentro de `/src/modules/admin/`:

```jsx
import { LoadingIndicator } from '../../common/components/LoadingIndicator';
import { DataTable } from '../../common/components/DataTable';
// etc.
```

## Contribuciones

Al añadir nuevos componentes a esta carpeta, asegúrate de que sean:

1.  **Genéricos:** Diseñados para no depender de la lógica específica de un solo módulo.
2.  **Configurables:** Acepten props para adaptar su contenido y comportamiento.
3.  **Documentados:** Incluyan JSDoc explicando su propósito y props.
4.  **Añadidos a este README:** Actualiza la lista de componentes disponibles. 