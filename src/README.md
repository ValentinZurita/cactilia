# Código Fuente Frontend de Cactilia (src/)

Este documento describe la organización y las convenciones del código fuente ubicado en el directorio `src/`, que corresponde al frontend de la aplicación Cactilia construida con React.

## Visión General

Este directorio contiene toda la lógica, componentes, estilos y configuración necesarios para la interfaz de usuario que interactúa con los servicios de backend (ubicados en el directorio `functions/` del proyecto raíz).

## Tech Stack Principal

*   **Framework:** React `^19.0.0`
*   **Build Tool:** Vite `^6.0.5`
*   **Routing:** React Router DOM `^7.1.3`
*   **State Management:** Redux Toolkit `^2.5.1` con React Redux `^9.2.0` y Redux Persist `^6.0.0`
*   **Styling:**
    *   Bootstrap `^5.3.3` (Usado principalmente para layout y componentes base. **Regla Estricta:** Módulo `admin` debe usar solo clases de Bootstrap, sin CSS custom ni inline styles).
    *   CSS (Archivos `.css` para estilos globales en `src/styles/` y estilos específicos de componentes).
*   **Formularios:** React Hook Form `^7.55.0`
*   **Lenguaje:** JavaScript (con adopción parcial/progresiva de **TypeScript** - ver sección abajo)
*   **Testing:** Jest `^29.7.0` con React Testing Library (`@testing-library/react@^16.3.0`)
*   **Integraciones Backend:**
    *   Firebase Client SDK `^11.2.0` (Auth, Firestore, Storage)
    *   Stripe React `^3.4.0` / Stripe.js `^6.0.0`

## Cómo Empezar

Asegúrate de tener Node.js (v20 recomendado, ver `functions/package.json`) y Yarn instalados.

1.  **Instalar Dependencias:**
    ```bash
    yarn install
    ```
    *(Nota: Si es la primera vez, también ejecuta `yarn install` dentro de la carpeta `functions/`)*

2.  **Configurar Variables de Entorno:**
    Copia `.env.example` a `.env` y rellena las variables necesarias (claves de Firebase, Stripe, etc.).
    ```bash
    cp .env.example .env
    # Edita .env con tus claves
    ```

3.  **Ejecutar Servidor de Desarrollo:**
    Inicia la aplicación en modo desarrollo con HMR (Hot Module Replacement).
    ```bash
    yarn dev
    ```

4.  **Ejecutar Emuladores de Firebase (Opcional pero Recomendado):**
    Para probar la integración con Firebase localmente:
    ```bash
    yarn emulators
    # O desde la carpeta functions/: firebase emulators:start --only functions,firestore
    ```

5.  **Construir para Producción:**
    Genera los archivos optimizados en la carpeta `dist/`.
    ```bash
    yarn build
    ```

6.  **Ejecutar Linters:**
    Verifica la calidad del código.
    ```bash
    yarn lint
    ```
    Para intentar arreglar automáticamente:
    ```bash
    yarn lint:fix
    ```

7.  **Ejecutar Tests:**
    *(Nota: Actualmente la carpeta `tests/` está ignorada en `.gitignore`. Si se revierte, este comando será relevante).*
    ```bash
    yarn test
    ```
    Para modo watch:
    ```bash
    yarn test:watch
    ```
    Para ver cobertura:
    ```bash
    yarn test:coverage
    ```

## Estructura de Directorios `src/`

```
src/
├── config/          # Configuraciones (Firebase client, Stripe client, App)
├── contexts/        # Contextos de React (StripeContext, AuthContext si aplica)
├── layout/          # Componentes de layout (AdminLayout, PublicLayout)
├── modules/         # Código organizado por funcionalidad principal
│   ├── admin/       # Módulo de administración (Bootstrap puro)
│   ├── auth/        # Módulo de autenticación (Login, Signup, Forgot Password)
│   ├── checkout/    # Módulo de proceso de pago
│   ├── public/      # Módulo de páginas públicas (Homepage, Contact, FAQ)
│   ├── shop/        # Módulo de tienda (Listado productos, Carrito, Detalles)
│   └── user/        # Módulo de perfil de usuario (Órdenes, Direcciones)
├── routes/          # Configuración de rutas y navegación (React Router)
├── scripts/         # Scripts específicos del frontend
├── shared/          # Componentes, hooks y utilidades compartidas
│   ├── assets/      # Recursos compartidos (imágenes, iconos, fuentes)
│   ├── components/  # Componentes React reutilizables en toda la app
│   ├── constants/   # Constantes compartidas
│   ├── hooks/       # Hooks personalizados reutilizables
│   └── utils/       # Utilidades genéricas de componentes/UI
├── store/           # Estado global con Redux Toolkit
│   ├── selectors/   # Selectores de Redux
│   └── slices/      # Slices de Redux (reducers, actions)
├── styles/          # Estilos CSS globales y específicos (NO usar en Admin)
└── utils/           # Utilidades generales (formateo, validación, Firebase utils client-side)
```

## Convenciones Clave

### Módulos (`src/modules/`)

Cada módulo encapsula una funcionalidad principal y sigue una estructura interna similar (puede variar):

```
modules/nombre-modulo/
├── components/      # Componentes específicos del módulo
├── hooks/           # Hooks específicos del módulo
├── pages/           # Páginas/Vistas del módulo (componentes contenedores)
├── services/        # Lógica de API/Firebase específica del módulo
├── styles/          # Estilos específicos del módulo (NO en admin)
├── utils/           # Utilidades específicas del módulo
├── constants/       # Constantes del módulo (si aplica)
├── routes/          # Definición de rutas del módulo (si aplica)
└── index.js         # Punto de entrada y exportaciones públicas
```

### Styling

*   **Global:** Archivos CSS en `src/styles/`.
*   **Componentes Compartidos:** Estilos asociados al componente, preferiblemente CSS Modules o archivos CSS importados.
*   **Módulo Admin:** **OBLIGATORIO** usar únicamente clases de utilidad de Bootstrap 5. No se permiten archivos CSS customizados ni estilos inline (atributo `style={...}`).
*   **Otros Módulos:** Pueden usar archivos CSS (idealmente locales al componente o dentro del `styles/` del módulo). Evitar estilos inline excesivos.

### TypeScript

El proyecto utiliza JavaScript pero está en proceso de adopción o uso parcial de TypeScript.
*   Nuevos componentes/archivos idealmente deberían escribirse en `.ts` o `.tsx`.
*   Usar interfaces para definir props y tipos de datos.
*   Evitar el uso de `any`.
*   Archivos de tipos (`.d.ts` o `.ts` con interfaces/types) son bienvenidos.

### Testing

*   Se utiliza Jest y React Testing Library.
*   Los archivos de test suelen ubicarse en carpetas `__tests__` dentro del directorio del componente/hook/utilidad que prueban.
*   *(Nota: La carpeta raíz `tests/` está actualmente ignorada por Git).*

### Importaciones (Alias)

Gracias a Vite, se usan alias para importaciones limpias:

```javascript
import Button from '@components/buttons-and-fields/Button'; // Desde shared/components
import { useAuth } from '@hooks/useAuth';         // Desde shared/hooks
import { firestore } from '@config/firebase';     // Desde config/firebase
import { loginUser } from '@modules/auth/services/authService'; // Desde un módulo
import store from '@store';                       // Desde store
```

Aliases configurados:
- `@`: `./src`
- `@components`: `./src/shared/components`
- `@hooks`: `./src/shared/hooks`
- `@utils`: `./src/utils` (Utilidades generales)
- `@modules`: `./src/modules`
- `@styles`: `./src/styles`
- `@store`: `./src/store`
- `@assets`: `./src/shared/assets`
- `@config`: `./src/config`
- `@contexts`: `./src/contexts`

### Backend (Cloud Functions)

La lógica de backend (API, triggers de base de datos, tareas pesadas, lógica con privilegios de admin) reside en un directorio separado `functions/` en la raíz del proyecto, que se despliega como Cloud Functions de Firebase. El frontend interactúa con estas funciones a través del SDK de Firebase.