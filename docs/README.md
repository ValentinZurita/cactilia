# Cactilia

Este proyecto es una aplicación web desarrollada con React y Vite, que utiliza Firebase como backend para gestionar autenticación, base de datos y almacenamiento.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

- **`/src`**: Contiene el código fuente principal de la aplicación
  - `/config`: Configuraciones de Firebase, Stripe y otras integraciones
  - `/contexts`: Contextos de React, incluyendo StripeContext
  - `/layout`: Componentes de layout para diferentes secciones
  - `/modules`: Organización modular del código por funcionalidad
    - `/admin`: Funcionalidades del panel de administración
    - `/auth`: Autenticación y gestión de usuarios
    - `/checkout`: Proceso de pago y finalización de compras
    - `/shop`: Tienda y catálogo de productos
  - `/routes`: Configuración de rutas y navegación
  - `/shared`: Componentes, hooks y utilidades compartidas
  - `/store`: Configuración y slices de Redux
  - `/styles`: Estilos CSS globales y específicos
  - `/utils`: Utilidades y helpers

- **`/functions`**: Funciones serverless de Firebase
  - `/payment`: Integraciones con Stripe y otros métodos de pago
  - `/notifications`: Envío de emails y notificaciones
  - `/admin`: Funciones específicas para administradores

- **`/scripts`**: Scripts de utilidad para desarrollo y despliegue

- **`/tests`**: Tests automatizados y manuales
  - `/caja-blanca-automatizadas`: Tests automatizados
  - `/caja-blanca-manual`: Tests manuales

- **`/docs`**: Documentación del proyecto

## Configuración Inicial

1. Instalar dependencias:
```
yarn install
```

2. Configurar variables de entorno:
   - Crea un archivo `.env` basado en `.env.example`

3. Iniciar servidor de desarrollo:
```
yarn dev
```

4. Ejecutar emuladores de Firebase (opcional):
```
yarn emulators
```

## Scripts Disponibles

- `yarn dev`: Inicia el servidor de desarrollo
- `yarn build`: Crea una build de producción
- `yarn test`: Ejecuta los tests
- `yarn emulators`: Inicia los emuladores de Firebase

## Tecnologías Principales

- React 19
- Vite
- Firebase (Auth, Firestore, Storage, Functions)
- Redux Toolkit
- React Router
- Stripe para pagos
