// src/modules/admin/index.js

// Importar la función de registro de bloques
import { registerAllBlockTypes } from './components/content/blocks';

// Inicializar el sistema de bloques
registerAllBlockTypes();

// Exportaciones principales
export { AdminRoutes } from './routes/AdminRoutes';
export { usePageContent } from './hooks/usePageContent';
export { useBlockOperations } from './hooks/useBlockOperations';

// Otras exportaciones necesarias
export * from './services/contentService';