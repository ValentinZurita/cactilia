# 🌵 Cactilia - Proyecto E-commerce

Este repositorio contiene el código fuente de la plataforma de comercio electrónico Cactilia.

El proyecto consiste en un frontend moderno construido con React y un backend impulsado por Firebase Cloud Functions.

## ✨ Resumen del Stack Tecnológico

Las tecnologías principales utilizadas en este proyecto incluyen:

* **Frontend:**
  * React `^19.0.0` (Biblioteca principal de UI)
  * Vite `^6.0.5` (Herramienta de construcción rápida)
  * React Router DOM `^7.1.3` (Enrutamiento del lado del cliente)
  * Redux Toolkit `^2.5.1` (Gestión del estado global)
  * React Hook Form `^7.55.0` (Manejo de formularios)
* **Backend (Cloud Functions):**
  * Node.js `20` (Entorno de ejecución)
  * Firebase Functions SDK `^4.3.1`
  * Firebase Admin SDK `^11.8.0` (Interacción con Firebase desde el backend)
* **Base de Datos y Servicios:**
  * Firebase Firestore (Base de datos NoSQL)
  * Firebase Authentication (Gestión de usuarios)
  * Firebase Storage (Almacenamiento de archivos)
  * Firebase Hosting (Despliegue de la aplicación)
* **Pagos:**
  * Stripe (Integración para procesamiento seguro de pagos)
* **Estilos (Styling):**
  * Bootstrap `^5.3.3` (Base para layout y componentes UI; **Regla Estricta:** módulo `admin` debe usar solo clases de Bootstrap)
  * CSS (Estilos personalizados donde sea necesario)
* **Testing:**
  * Jest `^29.7.0` (Framework de pruebas)
  * React Testing Library (Pruebas de componentes)
* **Gestor de Paquetes:**
  * Yarn

## 📂 Estructura del Proyecto

El proyecto sigue una organización estructurada:

```
cactilia/
├── functions/        # ✨ Código del backend (Firebase Cloud Functions)
│   ├── auth/
│   ├── payment/
│   ├── ... (módulos backend adicionales)
│   ├── index.js      # Punto de entrada de las funciones
│   └── package.json  # Dependencias del backend
├── public/           # Archivos estáticos (favicon, etc.)
├── src/              # ❤️ Código del frontend (React App)
│   ├── modules/      # Módulos por funcionalidad (admin, shop, user...)
│   ├── shared/       # Código reutilizable (componentes, hooks...)
│   ├── store/        # Configuración del estado Redux
│   ├── styles/       # Estilos globales
│   ├── config/       # Configuración del lado del cliente (Firebase, Stripe)
│   └── main.jsx      # Punto de entrada del frontend
├── .github/          # Workflows de GitHub Actions (CI/CD)
├── .gitignore        # Reglas de ignorar de Git
├── firebase.json     # Configuración de despliegue de Firebase
├── firestore.rules   # Reglas de seguridad de Firestore (¡Importante!)
├── package.json      # Dependencias y scripts del frontend/globales
├── vite.config.js    # Configuración de Vite
└── README.md         # 📄 Este archivo
```

Para una descripción detallada de la estructura del frontend, por favor consulta `src/README.md`.

## 🚀 Configuración para Desarrollo Local

Sigue estos pasos para configurar el proyecto para desarrollo local:

1. **Clona el Repositorio:**

   ```bash
   git clone <url-del-repositorio>
   cd cactilia
   ```
2. **Instala Dependencias del Frontend:**
   Instala las dependencias definidas en el `package.json` raíz.

   ```bash
   yarn install
   ```
3. **Instala Dependencias del Backend:**
   Las Cloud Functions tienen sus propias dependencias.

   ```bash
   cd functions
   yarn install
   cd ..
   ```
4. **Configura Variables de Entorno:**
   Se requieren claves de API para Firebase y Stripe.

   * Copia el archivo de ejemplo: `cp .env.example .env`
   * Abre `.env` y completa las variables con tus claves de desarrollo. No confirmes (commit) el archivo `.env`.
5. **Ejecuta el Servidor de Desarrollo:**
   Esto inicia el servidor de desarrollo de Vite con HMR.

   ```bash
   yarn dev
   ```

   La aplicación debería estar accesible en tu navegador (normalmente `http://localhost:5173`).
6. **Ejecuta los Emuladores de Firebase (Recomendado):**
   Para probar la integración con Firebase localmente sin usar recursos en la nube:

   ```bash
   yarn emulators
   ```

   Esto inicia una suite local que simula Firestore, Auth, Functions, etc., facilitando el desarrollo y las pruebas.

## 🛠️ Comandos Útiles (Scripts de Yarn)

Las tareas comunes están automatizadas mediante scripts de Yarn:

* `yarn dev`: Inicia el servidor de desarrollo local.
* `yarn build`: Construye la versión optimizada para producción en `dist/`.
* `yarn lint`: Verifica el código según las reglas de linting.
* `yarn lint:fix`: Intenta arreglar automáticamente los problemas de linting.
* `yarn test`: Ejecuta las pruebas unitarias y de integración. *(Nota: El directorio `tests/` está actualmente ignorado por Git).*
* `yarn test:watch`: Ejecuta las pruebas en modo interactivo (watch mode).
* `yarn test:coverage`: Genera un informe de cobertura de pruebas.
* `yarn emulators`: Inicia los emuladores locales de Firebase.
* `yarn deploy`: Despliega tanto el frontend como el backend a Firebase.
* `yarn deploy:functions`: Despliega solo las Cloud Functions.

## ☁️ Despliegue

La aplicación se despliega utilizando los servicios de Firebase:

* El frontend (React App) se sirve a través de **Firebase Hosting**.
* El backend (API, lógica de negocio) se ejecuta en **Cloud Functions**.

Los despliegues manuales se pueden realizar usando `yarn deploy` o `yarn deploy:functions`. Idealmente, los despliegues se manejan automáticamente a través de los workflows de CI/CD definidos en `.github/workflows/`.

## ⚙️ Convenciones y Notas Clave

* **Estilos (Styling):** Bootstrap 5 es el framework base. La sección `/admin` **debe** usar únicamente clases de utilidad de Bootstrap. Se puede usar CSS personalizado en otras partes de la aplicación. Evita estilos inline excesivos.
* **TypeScript:** El proyecto utiliza JavaScript con adopción progresiva de TypeScript. Idealmente, los nuevos archivos deberían escribirse en `.ts`/`.tsx`. Usa interfaces para props y tipos de datos. Evita usar el tipo `any`.
* **Testing:** La filosofía de testing implica usar Jest y React Testing Library. Se fomentan las pruebas unitarias para lógica compleja y componentes. *(Nota: El directorio raíz `tests/` está actualmente ignorado por Git).*
* **Backend:** La lógica sensible o las operaciones que requieren privilegios elevados residen en el directorio `functions/`. El frontend interactúa con estas funciones a través del SDK de Firebase.
