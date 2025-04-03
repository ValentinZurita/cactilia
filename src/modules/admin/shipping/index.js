/**
 * Módulo de gestión de reglas de envío
 * Permite configurar reglas de envío basadas en zonas geográficas
 */

// Exportar componentes principales
export { default as ShippingManagement } from './ShippingManagement';
export { default as ShippingForm } from './ShippingForm';

// Exportar páginas
export * from './pages';

// Exportar hooks
export { useShippingRules } from './hooks/useShippingRules';
export { useShippingForm } from './hooks/useShippingForm';

// Exportar utilidades
export * from './utils';
export * from './constants';

// Exportar tipos
export * from './types'; 