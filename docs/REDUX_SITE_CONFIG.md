# Gestión de Configuración Global del Sitio con Redux

Este documento describe la arquitectura implementada para gestionar y acceder a la configuración global del sitio (como información de la empresa, enlaces de redes sociales, etc.) de manera eficiente y consistente utilizando Redux.

## Problema Anterior

Anteriormente, componentes como la Página de Contacto (`ContactPage.jsx`) obtenían datos de configuración (ej: info de la empresa, enlaces sociales) directamente desde Firestore cada vez que se montaban. Esto resultaba en:

*   **Lecturas Repetidas a Firestore:** Múltiples llamadas a la base de datos para obtener datos que cambian con muy poca frecuencia.
*   **Latencia:** Cada llamada introducía una pequeña latencia en la carga del componente.
*   **Potencial Inconsistencia:** Si diferentes componentes obtenían los datos en momentos ligeramente distintos o usaban lógicas diferentes.

## Solución Implementada: Redux Slice (`siteConfigSlice`)

Para optimizar y centralizar estos datos, se implementó un slice dedicado en Redux:

*   **Slice:** `src/store/slices/siteConfigSlice.js`
*   **Estado Gestionado:**
    *   `companyInfo`: Información principal de la empresa (nombre, contacto, horario, dirección, etc.) obtenida de `settings/company_info` en Firestore.
    *   `socialLinks`: Array de enlaces de redes sociales obtenidos de `companyInfo/socialMedia` en Firestore.
    *   `status`: Estado de carga (`idle`, `loading`, `succeeded`, `failed`).
    *   `error`: Mensaje de error si la carga falla.

## Flujo de Datos

1.  **Carga Inicial:**
    *   Al iniciar la aplicación, el componente `src/App.jsx` utiliza un `useEffect`.
    *   Verifica si el estado (`status`) del `siteConfigSlice` es `'idle'`.
    *   Si es `'idle'`, despacha las acciones asíncronas (thunks) `fetchCompanyInfo()` y `fetchSocialLinks()` definidas en `siteConfigSlice.js`.
    *   Estos thunks realizan las llamadas a Firestore **una única vez**.
    *   Los reducers del slice actualizan el estado en el store de Redux con los datos obtenidos o el error.

2.  **Acceso a los Datos por Componentes:**
    *   Los componentes que necesitan acceder a esta información (ej: `ContactPage.jsx`, `Footer.jsx`, etc.) utilizan el hook `useSelector` de `react-redux` junto con los selectores exportados desde `siteConfigSlice.js`:
        *   `selectCompanyInfo`: Para obtener los datos de la empresa.
        *   `selectSocialLinks`: Para obtener los enlaces sociales.
        *   `selectSiteConfigStatus`: Para verificar el estado de carga (y mostrar spinners si es necesario).
        *   `selectSiteConfigError`: Para mostrar errores si la carga inicial falló.
    *   **Importante:** Estos componentes ya **no** deben realizar llamadas directas a los servicios de Firebase (`companyInfoService`, `getSocialMediaLinks`) ni usar hooks específicos como `useCompanyInfo` para obtener estos datos globales. Deben leerlos **siempre** del store de Redux.

## Beneficios

*   **Rendimiento:** Se reduce drásticamente el número de lecturas a Firestore, haciendo la carga de componentes dependientes más rápida después del inicio de la app.
*   **Consistencia:** Todos los componentes acceden a la misma instancia de los datos desde el store central.
*   **Código Limpio:** Se separa la lógica de obtención y gestión de estado global de la lógica de presentación de los componentes.
*   **Mantenibilidad:** Centralizar la lógica de carga facilita futuras modificaciones.

## Archivos Clave

*   `src/store/slices/siteConfigSlice.js`: Definición del slice, estado, thunks, reducers y selectores.
*   `src/store/store.js`: Configuración del store donde se incluye el reducer `siteConfig`.
*   `src/App.jsx`: Donde se despachan las acciones de carga inicial.
*   Componentes consumidores (ej: `src/modules/public/pages/ContactPage.jsx`): Usan `useSelector` para leer los datos. 