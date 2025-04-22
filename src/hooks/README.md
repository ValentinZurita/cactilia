# Hooks Reutilizables

Este directorio contiene hooks de React personalizados diseñados para ser reutilizables en diferentes partes de la aplicación.

## `usePageContent`

Este hook encapsula la lógica para cargar el contenido dinámico de una página (como FAQ, Política de Cookies, etc.) desde Firestore, gestionando automáticamente la carga de la versión correcta (borrador o publicada) y los estados asociados.

### Propósito

Simplificar los componentes de página pública que necesitan mostrar contenido gestionado desde el panel de administración. Se encarga de:

*   Detectar si se está en modo "Previsualización" (a través del parámetro de URL `?preview=true`).
*   Llamar a `ContentService` para obtener la versión `'draft'` o `'published'` del contenido según corresponda.
*   Manejar los estados de `loading` y `error` durante la carga.
*   Proporcionar datos de fallback si el contenido no se encuentra o si ocurre un error.

### Dependencias

*   `react-router-dom`: Utiliza `useLocation` para leer los parámetros de la URL.
*   `ContentService`: Llama a `ContentService.getPageContent` para interactuar con Firestore (ubicado en `src/modules/admin/components/content/shared/ContentService.js` o similar).

### Parámetros

*   `pageId` (string, **requerido**): El identificador único de la página cuyo contenido se desea cargar (ej: `'faq'`, `'cookies-policy'`).
*   `defaultContent` (object, opcional): Un objeto con la estructura esperada de los datos de la página (ej: `{ pageTitle: '', pageDescription: '', mainContent: '', faqItems: [] }`). Se utiliza como valor inicial y como fallback en caso de error o si el contenido no se encuentra. Por defecto es un objeto vacío con campos comunes.

### Valores de Retorno

Devuelve un objeto con las siguientes propiedades:

*   `pageData` (object | null): Los datos cargados de la página (ya sea borrador o publicado). Contendrá los datos por defecto si la carga falló o no se encontró contenido. Inicialmente es `null` hasta que la carga finaliza.
*   `loading` (boolean): `true` si la carga de datos está en progreso, `false` en caso contrario.
*   `error` (string | null): Un mensaje de error si la carga falló, o `null` si fue exitosa o está en progreso.
*   `isPreview` (boolean): `true` si el hook detectó `?preview=true` en la URL y cargó la versión `'draft'`, `false` en caso contrario.

### Ejemplo de Uso

```jsx
// En un componente de página pública, ej: src/modules/cookies/pages/CookiesPolicyPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { usePageContent } from '../../../hooks/usePageContent'; // Ajustar ruta
import { Spinner } from '../../../shared/components/spinner/Spinner';

const COOKIES_PAGE_ID = 'cookies-policy';
const DEFAULT_COOKIES_CONTENT = {
  pageTitle: 'Política de Cookies',
  pageDescription: 'Información sobre el uso de cookies en nuestro sitio web.',
  mainContent: '<p>Contenido por defecto...</p>', // O un string vacío
};

export const CookiesPolicyPage = () => {
  const { pageData, loading, error, isPreview } = usePageContent(
    COOKIES_PAGE_ID, 
    DEFAULT_COOKIES_CONTENT
  );

  if (loading) {
    return <Spinner />;
  }

  // pageData siempre tendrá contenido (el real o el por defecto)
  const { pageTitle, pageDescription, mainContent } = pageData;

  return (
    <div className="container py-4">
      {/* Helmet para SEO (Asegurarse de que no cause problemas en preview) */}
      {/* 
      <Helmet>
        <title>{`${pageTitle} - Mi Sitio`}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      */}

      <h1>{pageTitle}</h1>
      {isPreview && <p className="text-warning small">(Modo Previsualización)</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Renderizar contenido principal (si es HTML, usar dangerouslySetInnerHTML con precaución) */}
      <div dangerouslySetInnerHTML={{ __html: mainContent }} />
      
    </div>
  );
}; 