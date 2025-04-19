# Guía de Contribución a Cactilia

¡Gracias por tu interés en contribuir a Cactilia! Esta guía te ayudará a entender cómo puedes colaborar con el proyecto de manera efectiva.

## Estructura del Proyecto

El proyecto sigue una arquitectura modular. Familiarízate con la estructura del proyecto antes de comenzar:

```
src/
  ├── modules/       # Organización por funcionalidad
  ├── shared/        # Componentes y utilidades compartidas
  ├── store/         # Estado global con Redux
  └── ...
```

## Flujo de Trabajo

1. Crea un fork del repositorio
2. Crea una nueva rama para tu funcionalidad: `feature/nombre-funcionalidad`
3. Desarrolla tu funcionalidad o corrección
4. Asegúrate de escribir pruebas para el nuevo código
5. Ejecuta las pruebas: `yarn test`
6. Crea un Pull Request a la rama `main`

## Estándares de Código

### Convenciones de Nombres

- **Componentes**: PascalCase (ej. `ProductCard.jsx`)
- **Archivos de utilidades**: camelCase (ej. `formatDate.js`)
- **Constantes**: UPPER_SNAKE_CASE (ej. `MAX_ITEMS`)
- **Hooks personalizados**: Prefijo `use` (ej. `useProductData.js`)

### Estructura de Componentes

Para componentes nuevos, sigue esta estructura:

```jsx
// Imports
import React from 'react';
import PropTypes from 'prop-types';

// Component
function ComponentName({ prop1, prop2 }) {
  // Lógica

  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

ComponentName.defaultProps = {
  prop2: 0,
};

export default ComponentName;
```

### Módulos Nuevos

Si estás creando un nuevo módulo, sigue la estructura:

```
modules/nuevo-modulo/
  ├── components/     # Componentes específicos del módulo
  ├── hooks/          # Hooks específicos del módulo
  ├── services/       # Servicios de datos
  └── index.js        # Punto de entrada y exportaciones públicas
```

## Pruebas

- Escribir pruebas para componentes nuevos y modificados
- Cobertura mínima del 70% para código nuevo
- Ejecutar pruebas antes de crear un PR: `yarn test`

## CI/CD

- Las pruebas y el linting se ejecutan automáticamente en cada PR
- Asegúrate de que todas las verificaciones pasen antes de solicitar revisión

## Commits

Sigue el formato de Conventional Commits:

- `feat:` Para nuevas funcionalidades
- `fix:` Para correcciones de errores
- `docs:` Para cambios en la documentación
- `style:` Para cambios que no afectan el significado del código
- `refactor:` Para refactorizaciones
- `test:` Para añadir o modificar pruebas
- `chore:` Para tareas de mantenimiento

Ejemplo: `feat: añadir filtro de productos por categoría`

## Preguntas

Si tienes alguna pregunta, no dudes en abrir un issue o contactar con los mantenedores.