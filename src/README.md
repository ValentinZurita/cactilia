# Estructura del Código Fuente de Cactilia

Esta documentación proporciona una visión general de la organización del código fuente de la aplicación Cactilia.

## Estructura de Directorios

```
src/
├── config/               # Configuraciones centralizadas
│   ├── app/              # Configuración general de la aplicación
│   ├── firebase/         # Configuración de Firebase
│   └── stripe/           # Configuración de Stripe
├── contexts/             # Contextos de React (StripeContext, etc.)
├── layout/               # Componentes de layout (AdminLayout, PublicLayout)
├── modules/              # Organización modular del código por funcionalidad
│   ├── admin/            # Módulo de administración
│   ├── auth/             # Módulo de autenticación
│   ├── checkout/         # Módulo de checkout
│   ├── contact/          # Módulo de contacto
│   ├── emails/           # Módulo de gestión de emails
│   ├── finance/          # Módulo de finanzas
│   ├── public/           # Módulo de páginas públicas
│   ├── shop/             # Módulo de tienda
│   └── user/             # Módulo de gestión de usuarios
├── routes/               # Configuración de rutas y navegación
├── scripts/              # Scripts específicos de la aplicación
├── shared/               # Componentes, hooks y utilidades compartidas
│   ├── assets/           # Recursos compartidos (imágenes, iconos)
│   ├── components/       # Componentes React reutilizables
│   ├── constants/        # Constantes compartidas
│   ├── fonts/            # Fuentes tipográficas
│   ├── hooks/            # Hooks personalizados de React
│   └── utils/            # Utilidades específicas de componentes
├── store/                # Estado global con Redux
│   ├── auth/             # Estado relacionado con autenticación
│   ├── messages/         # Estado relacionado con mensajes/notificaciones
│   ├── selectors/        # Selectores de Redux
│   └── slices/           # Slices de Redux Toolkit
├── styles/               # Estilos CSS globales y específicos
│   ├── components/       # Estilos para componentes
│   ├── pages/            # Estilos para páginas
│   └── users/            # Estilos para sección de usuarios
└── utils/                # Utilidades generales
    ├── firebase/         # Utilidades relacionadas con Firebase
    ├── formatting/       # Utilidades para formateo (fechas, moneda, texto)
    ├── storage/          # Utilidades para almacenamiento y caché
    └── validation/       # Utilidades para validación de datos
```

## Patrones y Convenciones

### Módulos

Cada módulo sigue una estructura consistente:

```
modules/nombre-modulo/
├── components/           # Componentes específicos del módulo
├── hooks/                # Hooks específicos del módulo
├── pages/                # Páginas del módulo
├── services/             # Servicios de datos del módulo
├── utils/                # Utilidades específicas del módulo
├── constants.js          # Constantes del módulo
├── routes.js             # Rutas del módulo
└── index.js              # Punto de entrada y exportaciones públicas
```

### Importaciones

Gracias a los alias configurados en `vite.config.js` y `jsconfig.json`, puedes usar importaciones más limpias:

```javascript
// En lugar de importaciones relativas complejas
import Button from '../../../../shared/components/Button';

// Usa alias
import Button from '@components/Button';
```

Aliases disponibles:
- `@` → `./src`
- `@components` → `./src/shared/components`
- `@hooks` → `./src/shared/hooks`
- `@utils` → `./src/utils`
- `@modules` → `./src/modules`
- `@styles` → `./src/styles`
- `@store` → `./src/store`
- `@assets` → `./src/shared/assets`
- `@config` → `./src/config`
- `@contexts` → `./src/contexts`

## Utilidades

El módulo `utils` proporciona funciones útiles organizadas por categoría:

```javascript
// Importación por categoría
import { firebase } from '@utils';
firebase.callFirebaseFunction('myFunction', data);

// O importación directa de funciones específicas
import { formatDate, isValidEmail } from '@utils';
```

## Configuración

El módulo `config` centraliza las configuraciones:

```javascript
// Importar configuración específica
import { stripeConfig } from '@config';

// O valores específicos
import { APP_CONFIG, ROUTES } from '@config';
```