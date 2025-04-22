# Módulo de Gestión de Preguntas Frecuentes (FAQ - Admin)

## Descripción General

Este módulo permite a los administradores gestionar la página pública de Preguntas Frecuentes (FAQ). Ofrece una interfaz para:
-   Editar el título y la descripción SEO de la página.
-   Añadir, editar, eliminar y reordenar pares de preguntas y respuestas.

Los cambios pueden guardarse como borrador o publicarse.

## Ubicación

Los archivos principales de este módulo se encuentran en:
`src/modules/admin/components/content/faq/`

## Componentes Principales

-   **`FaqManagementPage.jsx`**: Componente de nivel de página.
    -   Usa el hook `useFaqManagement` para estado y lógica.
    -   Renderiza `AlertMessage` y `FaqEditor`.

-   **`FaqEditor.jsx`**: Componente principal que contiene el editor completo.
    -   Renderiza `EditorToolbar` y `EditorActionBar`.
    -   **Usa el componente reutilizable `PageMetadataEditor` para título y descripción de la página.**
    -   Renderiza una lista de componentes `FaqItemEditor` para cada pregunta/respuesta.
    -   Maneja el estado local de toda la página (`pageData` que incluye `pageTitle`, `pageDescription`, y `faqItems`).
    -   Implementa la lógica para añadir (`handleAddItem`), eliminar (`handleRemoveItem`) y reordenar (`handleMoveItemUp`, `handleMoveItemDown`) los items.
    -   Detecta cambios pendientes (`isDirty`).
    -   Llama a callbacks (`onSave`, `onPublish`) pasados como props.

-   **`FaqItemEditor.jsx`**: Componente para editar *una sola* pregunta y respuesta.
    -   Recibe el `item` (pregunta/respuesta) y el `index` como props.
    -   Recibe callbacks (`onUpdate`, `onRemove`, `onMoveUp`, `onMoveDown`) para delegar las acciones al `FaqEditor`.
    -   Contiene los inputs para la pregunta y la respuesta, y los botones de acción (subir, bajar, eliminar).

-   **`(Compartido) PageMetadataEditor.jsx`**: Componente reutilizable para editar título y descripción de la página.

-   **`(Compartido) EditorToolbar.jsx`**: Barra de herramientas reutilizable (previsualización, indicador de cambios).

-   **`(Compartido) EditorActionBar.jsx`**: Barra de acciones reutilizable (botones Guardar/Publicar, estado de carga).

## Hook de Lógica

-   **`useFaqManagement.js`**: Hook que encapsula la lógica de carga, guardado y publicación para FAQ.
    -   Usa `faqService` (que probablemente interactúa con Firestore) y `ContentService` (para publicar).
    -   Maneja estado (`initialData`, `currentData`, `status`, `alertInfo`).
    -   Define `saveDraft` (usando `saveFaqContent`) y `publishChanges` (usando `saveFaqContent` y luego `publishPageContent`).

## Flujo de Datos (Simplificado)

1.  **Carga:** `Page` monta -> `Hook` carga datos (`getFaqContent`) -> `initialData`/`currentData` -> `Editor` recibe `initialData`.
2.  **Edición (Metadata):** Usuario edita en `PageMetadataEditor` -> `onChange` -> `handlePageDataChange` en `FaqEditor` actualiza `pageData` -> `isDirty`.
3.  **Edición (Items):** Usuario edita en `FaqItemEditor` -> `onChange` -> `onUpdate` (prop) -> `handleUpdateItem` en `FaqEditor` actualiza `pageData.faqItems` -> `isDirty`.
4.  **Añadir/Eliminar/Mover Item:** Usuario clica botón en `FaqItemEditor` o `FaqEditor` -> Llama a callback (`onRemove`/`onMoveUp`/etc.) -> Llama a handler (`handleRemoveItem`/etc.) en `FaqEditor` que actualiza `pageData.faqItems` -> `isDirty`.
5.  **Guardar/Publicar:** Usuario clica botón en `ActionBar` -> `Editor` llama a `onSave`/`onPublish` (props) -> `Page` llama a la función del `Hook` (`saveDraft`/`publishChanges` pasándole `currentData`) -> `Hook` interactúa con `faqService`/`ContentService`.

## Archivos Relacionados

-   `faqService.js`: Contiene la lógica específica para interactuar con Firestore para obtener y guardar el contenido de FAQ (probablemente en `adminContent/faq`). 