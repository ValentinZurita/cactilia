# Sistema Genérico de Gestión de Contenido Estático (Admin)

## Filosofía y Propósito

Este conjunto de componentes y hooks compartidos (`shared`) tiene como objetivo proporcionar una solución **DRY (Don't Repeat Yourself)** y **modular** para administrar páginas de contenido estático simple dentro del panel de administración. 

Siguiendo los principios de **Clean Code** y **componentes pequeños y enfocados**, este sistema permite añadir nuevas páginas de contenido (como "Política de Cookies", "Acerca de Nosotros", "Términos y Condiciones") con un mínimo esfuerzo y sin duplicar lógica de carga, guardado, publicación o interfaz de usuario básica.

La idea es tener componentes de página de alto nivel (`GenericContentPage`) que actúen como **contenedores abstractos**, orquestando la lógica (a través de `useGenericContentManagement`) y la presentación (a través de `GenericContentEditor`), manteniendo el código limpio, legible y fácil de mantener.

## Componentes y Hooks Clave

1.  **`useGenericContentManagement(pageId, defaultContent)`** (Hook)
    *   **Responsabilidad:** Encapsula toda la lógica de estado y comunicación con el backend (`ContentService`) para *una* página de contenido estático, identificada por `pageId`.
    *   **Entradas:** `pageId` (string, obligatorio), `defaultContent` (object, opcional, para valores iniciales si la página no existe).
    *   **Salidas:** `pageData` (datos actuales), `status` (estado de carga/guardado), `alertInfo` (mensajes), `saveDraft`, `publishChanges`, `setPageData`, `clearAlert`.
    *   **Uso:** Se instancia dentro del componente de página (`GenericContentPage`).

2.  **`GenericContentPage`** (Componente de Página)
    *   **Responsabilidad:** Actúa como el contenedor de alto nivel para la interfaz de administración de una página de contenido estático específica.
    *   **Props:** `pageId` (string, obligatorio), `pageTitleAdmin` (string, obligatorio, título para la UI del admin), `defaultContent` (opcional), `contentLabel` (opcional), `contentPlaceholder` (opcional).
    *   **Estructura:**
        *   Invoca `useGenericContentManagement` con el `pageId` y `defaultContent`.
        *   Renderiza `AlertMessage` para mostrar notificaciones.
        *   Renderiza el título de la página de administración (`pageTitleAdmin`).
        *   Renderiza `GenericContentEditor`, pasándole los datos y callbacks del hook, además de `pageId` y las props de personalización (`contentLabel`, `contentPlaceholder`).
        *   Maneja el estado de carga inicial mostrando un mensaje/spinner.
    *   **Modularidad:** No contiene lógica de negocio directa, solo estructura y paso de props.

3.  **`GenericContentEditor`** (Componente Editor)
    *   **Responsabilidad:** Provee la interfaz de usuario (formulario) para editar el contenido de una página estática genérica.
    *   **Props:** `pageId`, `initialData`, `onSave`, `onPublish`, `isLoading`, `onDataChange`, `contentLabel`, `contentPlaceholder`.
    *   **Estructura:**
        *   Renderiza `EditorToolbar`.
        *   Renderiza `PageMetadataEditor` (para título y descripción SEO).
        *   Renderiza el área de texto para el `mainContent` (usando `contentLabel` y `contentPlaceholder`).
        *   Renderiza `EditorActionBar`.
    *   **Estado Interno:** Maneja `localData` (copia de los datos para edición) y `isDirty` (para detectar cambios).
    *   **Interacción:** Llama a `onDataChange` cuando los campos cambian y a `onSave`/`onPublish` cuando se interactúa con `EditorActionBar`.

4.  **`PageMetadataEditor`** (Componente Editor Compartido)
    *   **Responsabilidad:** Edita exclusivamente el título (`pageTitle`) y la descripción SEO (`pageDescription`) de una página.
    *   **Reutilización:** Usado por `GenericContentEditor` y también por `FaqEditor.jsx`.

5.  **`EditorToolbar` y `EditorActionBar`** (Componentes UI Compartidos)
    *   **Responsabilidad:** Proporcionan la barra superior (previsualización, cambios) y la barra inferior (botones de guardar/publicar, estado) de forma consistente en todos los editores de contenido.

## Cómo Añadir una Nueva Página de Contenido Estático

Gracias a este sistema genérico, añadir una nueva página (ej. "Acerca de Nosotros" con `pageId='about-us'`) es muy sencillo:

1.  **Definir el `pageId`:** Elige un identificador único (ej. `'about-us'`).
2.  **Actualizar Rutas:** Ve a `src/modules/admin/routes/AdminRoutes.jsx`:
    *   Añade una nueva entrada al array `contentRoutes` (si aplica para la navegación lateral) o directamente una nueva ruta `<Route>`.
    *   En el `element` de la ruta, renderiza `<GenericContentPage>` pasando las props requeridas:
        ```jsx
        <Route 
          path="content/about-us" // O la ruta deseada
          element={
            <Suspense fallback={<Spinner />}> // O el fallback adecuado
              <GenericContentPage 
                pageId="about-us" 
                pageTitleAdmin="Gestionar Página 'Acerca de Nosotros'"
                defaultContent={{ pageTitle: 'Acerca de Nosotros' }} // Opcional: título por defecto
                contentLabel="Contenido Principal de 'Acerca de'" // Opcional
                contentPlaceholder="Escribe aquí la historia de la empresa..." // Opcional
              />
            </Suspense>
          }
        />
        ```
3.  **(Opcional) Añadir Entrada de Menú:** Si la nueva ruta se añadió directamente (y no a través de `contentRoutes`), actualiza el componente de navegación (`AdminSidebar` o similar) si deseas que aparezca en el menú lateral.

¡Eso es todo! No necesitas crear nuevos hooks, páginas o editores específicos para la nueva página. 