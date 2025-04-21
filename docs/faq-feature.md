# Funcionalidad de Preguntas Frecuentes (FAQ)

Este documento describe la implementación de la sección de Preguntas Frecuentes (FAQ) en el proyecto, tanto la interfaz de administración para gestionar el contenido como la página pública para mostrarlo a los usuarios.

## Índice

1.  [Propósito](#propósito)
2.  [Estructura de Archivos](#estructura-de-archivos)
3.  [Gestión en el Admin](#gestión-en-el-admin)
    *   [Componentes Principales](#componentes-principales-admin)
    *   [Flujo de Trabajo](#flujo-de-trabajo-admin)
4.  [Visualización Pública](#visualización-pública)
    *   [Componentes Principales](#componentes-principales-público)
    *   [Modo Previsualización](#modo-previsualización)
5.  [Estructura de Datos (Firestore)](#estructura-de-datos-firestore)
6.  [Componentes y Hooks Clave](#componentes-y-hooks-clave)

## Propósito

La funcionalidad de FAQ permite a los administradores del sitio crear, editar, reordenar y publicar una lista de preguntas y sus correspondientes respuestas. Estas FAQ se muestran luego en una página pública dedicada (`/faq`) para que los visitantes del sitio puedan consultarlas.

## Estructura de Archivos

Los archivos relevantes para esta funcionalidad se encuentran en las siguientes ubicaciones:

*   **Administración:**
    *   `src/modules/admin/components/content/faq/`: Contiene los componentes de la interfaz de edición.
        *   `FaqManagementPage.jsx`: Página principal de gestión.
        *   `FaqEditor.jsx`: Editor principal que contiene la lista y campos generales.
        *   `FaqItemEditor.jsx`: Editor para un único par pregunta/respuesta.
        *   `faqService.js`: Lógica para interactuar con Firestore (borradores).
        *   `useFaqManagement.js`: Hook que encapsula la lógica de estado y acciones de la página de gestión.
    *   `src/modules/admin/components/content/shared/`: Componentes compartidos usados por el editor.
        *   `EditorToolbar.jsx`: Barra superior con previsualización.
        *   `EditorActionBar.jsx`: Barra inferior con botones Guardar/Publicar.
        *   `ContentService.js`: Servicio centralizado para operaciones de contenido (incluida la publicación).
*   **Público:**
    *   `src/modules/faq/pages/FaqPage.jsx`: Componente de la página pública `/faq`.
    *   `src/modules/faq/components/FaqAccordion.jsx`: Componente reutilizable para renderizar el acordeón de FAQ.
    *   `src/modules/faq/hooks/useFaqPageData.js`: Hook que carga los datos para la página pública (publicados o borrador).
*   **Rutas:**
    *   `src/routes/AppRouter.jsx`: Define la ruta pública `/faq`.
    *   `src/modules/admin/routes/AdminRoutes.jsx`: Define la ruta de administración `/admin/content/faq`.
*   **Navegación Admin:**
    *   `src/modules/admin/components/dashboard/Sidebar.jsx`: Contiene el enlace a "Gestionar FAQ".

## Gestión en el Admin

### Componentes Principales (Admin)

*   `FaqManagementPage`: Orquesta la carga de datos usando `useFaqManagement` y renderiza `FaqEditor`. Maneja el estado general (loading, error).
*   `useFaqManagement`: Hook que contiene toda la lógica de estado (`initialData`, `currentData`, `status`, `error`) y las funciones para interactuar con los servicios (`saveDraft`, `publishChanges`).
*   `FaqEditor`: Componente principal de la UI de edición.
    *   Renderiza `EditorToolbar` (para previsualizar) y `EditorActionBar` (para guardar/publicar).
    *   Muestra campos para editar el título y descripción de la página.
    *   Renderiza una lista de `FaqItemEditor`.
    *   Maneja el estado local de los datos (`pageData`) y detecta cambios (`isDirty`).
    *   Permite añadir nuevos items y llama a los callbacks `onSave`/`onPublish` pasados por `FaqManagementPage`.
*   `FaqItemEditor`: Representa una tarjeta para editar una pregunta/respuesta. Permite la edición de texto, eliminación y reordenamiento mediante botones "Subir"/"Bajar".

### Flujo de Trabajo (Admin)

1.  El administrador navega a "Gestión de Contenido" > "Gestionar FAQ" en el sidebar.
2.  `FaqManagementPage` usa `useFaqManagement` para cargar los datos del borrador (`content/faq`).
3.  `FaqEditor` muestra los datos cargados.
4.  El administrador puede:
    *   Editar el título y descripción de la página.
    *   Añadir nuevas preguntas/respuestas.
    *   Editar el texto de preguntas/respuestas existentes.
    *   Reordenar las preguntas usando los botones de flecha.
    *   Eliminar preguntas.
5.  **Previsualizar:** Al hacer clic en "Previsualizar página" (`EditorToolbar`), se guardan los cambios actuales en el borrador y se abre una nueva pestaña con `/faq?preview=true`.
6.  **Guardar Borrador:** Al hacer clic en "Guardar borrador" (`EditorActionBar`), `useFaqManagement` llama a `saveFaqContent` para actualizar el documento en `content/faq`.
7.  **Publicar:** Al hacer clic en "Publicar" (`EditorActionBar`), `useFaqManagement` primero guarda el borrador actual y luego llama a `ContentService.publishPageContent('faq')` para copiar los datos de `content/faq` a `content_published/faq`.

## Visualización Pública

### Componentes Principales (Público)

*   `FaqPage`: Componente principal de la página `/faq`.
    *   Usa `useFaqPageData` para obtener los datos y el estado.
    *   Maneja los estados de carga y error.
    *   Renderiza el título, descripción y el componente `FaqAccordion`.
*   `useFaqPageData`: Hook que determina si cargar datos publicados (`getPublishedFaqContent`) o el borrador (`getFaqContent`) basado en el parámetro URL `?preview=true`. Maneja el estado de carga y error.
*   `FaqAccordion`: Componente presentacional que recibe un array de `items` y los renderiza como un acordeón de Bootstrap, aplicando estilos y lógica de colapso.

### Modo Previsualización

Cuando se accede a `/faq?preview=true` (generalmente desde el botón "Previsualizar" del admin), el hook `useFaqPageData` detecta el parámetro y carga los datos desde la colección `content` (el borrador más reciente guardado) en lugar de `content_published`. Esto permite al administrador ver los cambios antes de publicarlos. La página muestra un pequeño indicador "Modo Previsualización".

## Estructura de Datos (Firestore)

La información de la página FAQ se almacena en dos colecciones principales:

*   **`content` (Borradores):**
    *   Documento: `faq`
    *   Campos:
        *   `id`: "faq"
        *   `pageTitle`: "Preguntas Frecuentes" (o lo que edite el admin)
        *   `pageDescription`: Descripción corta para SEO.
        *   `faqItems`: **Array** de objetos, donde cada objeto representa una Q&A:
            *   `id`: ID único (generado por `uuid`).
            *   `question`: Texto de la pregunta.
            *   `answer`: Texto de la respuesta.
            *   `order?`: (Opcional) Número para ordenamiento manual si se implementa.
        *   `createdAt`: Timestamp de creación.
        *   `updatedAt`: Timestamp de última modificación del borrador.
*   **`content_published` (Contenido Público):**
    *   Documento: `faq`
    *   Estructura: Idéntica a la del borrador en el momento de la publicación, pero con un campo adicional `publishedAt`.

## Componentes y Hooks Clave

*   `useFaqManagement`: Maneja estado y lógica de acciones para la página de admin.
*   `useFaqPageData`: Maneja carga de datos y estado para la página pública.
*   `FaqManagementPage`: Contenedor de la página de admin.
*   `FaqEditor`: UI principal de edición en admin.
*   `FaqItemEditor`: UI para editar una Q&A individual en admin.
*   `FaqPage`: Contenedor de la página pública.
*   `FaqAccordion`: Componente de UI para mostrar el acordeón público.
*   `faqService`: Funciones de bajo nivel para leer/escribir en Firestore (colección `content`).
*   `ContentService`: Servicio centralizado que incluye la función `publishPageContent`.
*   `EditorToolbar`: Componente compartido para la barra de herramientas superior (previsualizar).
*   `EditorActionBar`: Componente compartido para la barra de acciones inferior (guardar/publicar). 