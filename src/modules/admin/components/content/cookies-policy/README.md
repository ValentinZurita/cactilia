# Módulo de Gestión de Política de Cookies (Admin)

## Descripción General

Este módulo permite a los administradores del sitio web gestionar el contenido de la página pública de "Política de Cookies". Proporciona una interfaz para editar el título, la descripción (para SEO) y el contenido principal de la política. Los cambios pueden guardarse como borrador o publicarse directamente.

## Ubicación

Los archivos principales de este módulo se encuentran en:
`src/modules/admin/components/content/cookies-policy/`

## Componentes Principales

-   **`CookiesPolicyManagementPage.jsx`**: Es el componente de nivel de página que se renderiza en la ruta de administración correspondiente. 
    -   Utiliza el hook `useCookiesPolicyManagement` para obtener el estado y las funciones de gestión.
    -   Renderiza `AlertMessage` para mostrar notificaciones (éxito, error).
    -   Renderiza `CookiesPolicyEditor` pasándole los datos iniciales y los callbacks para guardar/publicar.
    -   Maneja la visualización del estado de carga inicial.

-   **`CookiesPolicyEditor.jsx`**: Es el componente que contiene el formulario de edición.
    -   Recibe `initialData` y los callbacks `onSave`, `onPublish` como props.
    -   Mantiene un estado local (`localData`) para los campos del formulario (título, descripción, contenido principal).
    -   Utiliza los componentes compartidos `EditorToolbar` (para previsualizar) y `EditorActionBar` (para los botones de Guardar/Publicar).
    -   Notifica al componente padre (`CookiesPolicyManagementPage`) sobre cambios en los datos a través del callback `onDataChange`, que actualiza el estado en el hook.
    -   Llama a `onSave(localData)` o `onPublish(localData)` cuando se interactúa con `EditorActionBar`.
    -   **Usa el componente reutilizable `PageMetadataEditor` para los campos de título y descripción.**

-   **`(Compartido) PageMetadataEditor.jsx`**: Componente reutilizable para editar título y descripción de la página.

-   **`(Compartido) EditorToolbar.jsx`**: Barra de herramientas reutilizable que muestra el enlace de previsualización y si hay cambios pendientes.

-   **`(Compartido) EditorActionBar.jsx`**: Barra de acciones reutilizable con los botones "Guardar Borrador" y "Publicar", y muestra el estado de carga/guardado.

## Hook de Lógica

-   **`useCookiesPolicyManagement.js`**: Hook personalizado que encapsula toda la lógica de estado y comunicación con el backend para esta sección.
    -   **Estado:** Maneja `pageData` (datos actuales), `status` (loading, saving, publishing, error, idle) y `alertInfo` (para mensajes al usuario).
    -   **Carga Inicial:** Al montarse, utiliza `ContentService.getPageContent('cookies-policy', 'draft')` para obtener el borrador actual del contenido desde Firestore.
    -   **Guardar Borrador (`saveDraft`):** Llama a `ContentService.savePageContent('cookies-policy', dataToSave)` para guardar los datos en Firestore como borrador.
    -   **Publicar Cambios (`publishChanges`):** 
        1.  Primero, guarda los datos actuales como borrador (`ContentService.savePageContent`).
        2.  Si el guardado es exitoso, llama a `ContentService.publishPageContent('cookies-policy')` para copiar el borrador a la colección de contenido publicado.
    -   **Manejo de Errores:** Captura errores durante las operaciones y actualiza `status` y `alertInfo`.

## Flujo de Datos

1.  **Carga:** `CookiesPolicyManagementPage` monta -> `useCookiesPolicyManagement` se inicializa -> Llama a `ContentService.getPageContent` -> `pageData` se actualiza -> Se pasa como `initialData` a `CookiesPolicyEditor`.
2.  **Edición:** Usuario modifica campos en `CookiesPolicyEditor` -> El estado `localData` del editor se actualiza -> Se llama a `onDataChange` -> `setPageData` en el hook actualiza `pageData`.
3.  **Guardar Borrador:** Usuario clica "Guardar" -> `EditorActionBar` llama `onSave` -> `CookiesPolicyEditor` llama `saveDraft(localData)` (prop) -> `CookiesPolicyManagementPage` llama `saveDraft` del hook -> El hook llama `ContentService.savePageContent`.
4.  **Publicar:** Usuario clica "Publicar" -> `EditorActionBar` llama `onPublish` -> `CookiesPolicyEditor` llama `publishChanges(localData)` (prop) -> `CookiesPolicyManagementPage` llama `publishChanges` del hook -> El hook llama `savePageContent` y luego `publishPageContent`.

## Consideraciones Futuras / TODOs

-   En `CookiesPolicyEditor.jsx`, el campo `mainContent` es actualmente un `<textarea>` simple. Se ha dejado un `TODO` para considerar la implementación de un editor de texto enriquecido (Rich Text Editor - RTE) si se requiere formato avanzado para la política. 