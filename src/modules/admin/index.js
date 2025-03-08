// src/modules/admin/index.jsx

// Importar la función de registro de bloques
import { registerAllBlockTypes } from './components/content/blocks/index.jsx';

// Inicializar el sistema de bloques
registerAllBlockTypes();

// Exportaciones principales
export { AdminRoutes } from './routes/AdminRoutes';
export { usePageContent } from './hooks/usePageContent';
export { useBlockOperations } from './hooks/useBlockOperations';

// Otras exportaciones necesarias
export * from './services/contentService';