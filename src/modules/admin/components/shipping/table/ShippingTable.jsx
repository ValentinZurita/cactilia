import React from 'react';
// Importar los nuevos componentes
import { LoadingIndicator } from '../components/LoadingIndicator';
import { EmptyState } from '../components/EmptyState';
import { RulesTableData } from './RulesTableData'; // Componente para la tabla en sí

/**
 * Componente principal de la tabla para mostrar reglas de envío.
 * Maneja los diferentes estados (carga, vacío, sin resultados, con datos)
 * y delega la renderización a componentes específicos.
 */
export const ShippingTable = ({
  rules,
  loading,
  // error, // El error general se maneja en el contenedor
  onEdit,
  onDelete,
  // onSearch, // La búsqueda se maneja en el contenedor
  searchTerm // Se recibe solo para lógica de 'sin resultados'
  // onCreateNew // El botón crear se maneja en el contenedor
}) => {

  // Determinar los estados booleanos para la renderización condicional
  const hasSearchTerm = Boolean(searchTerm);
  const hasRules = rules && rules.length > 0;
  const showLoading = loading;
  const showEmptySearchResults = !loading && hasSearchTerm && !hasRules;
  const showNoRulesMessage = !loading && !hasSearchTerm && !hasRules;
  const showTable = !loading && hasRules;

  return (
    <div className="shipping-rules-list">
      {/* --- UI de Búsqueda y Botón Crear MOVIDA al ShippingTableContainer --- */}
      {/* <div className="d-flex justify-content-end mb-3"> ... Botón Crear ... </div> */}
      {/* <div className="mb-4"> ... Barra de Búsqueda ... </div> */}

      {/* 1. Estado de Carga */} 
      {showLoading && (
        <LoadingIndicator message="Cargando reglas de envío..." />
      )}

      {/* 2. Estado: Sin Resultados de Búsqueda */} 
      {showEmptySearchResults && (
        <EmptyState 
          iconClass="bi bi-search"
          title="No se encontraron reglas que coincidan"
          message="Intenta con otros términos de búsqueda"
        />
      )}

      {/* 3. Estado: Tabla con Datos */} 
      {showTable && (
        <RulesTableData 
          rules={rules} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      )}

      {/* 4. Estado: No hay Reglas (y no se está buscando) */} 
      {showNoRulesMessage && (
        <EmptyState 
          iconClass="bi bi-geo-alt"
          title="No hay reglas de envío configuradas"
          message="Añade tu primera regla para configurar los envíos."
          // Aquí se podría añadir un botón "Crear Regla" si quisiéramos,
          // pero actualmente ese botón está en ShippingTableContainer
          // children={<button>...</button>}
        />
      )}
    </div>
  );
};