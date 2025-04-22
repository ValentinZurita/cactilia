import React, { useState, useEffect, useCallback } from 'react';
import { ShippingTable } from '../table/ShippingTable';
import { useShippingRules } from '../hooks/useShippingRules';
import { SearchBar } from '../components/SearchBar';
import { CreateButton } from '../components/CreateButton';

/**
 * Contenedor para la lógica de la tabla de reglas de envío.
 * Maneja la carga, filtrado, búsqueda, eliminación.
 * Renderiza la barra de búsqueda y la tabla.
 * Incluye un Botón Flotante de Acción (FAB) para crear nuevas reglas.
 */
export const ShippingTableContainer = ({ onEdit, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    shippingRules, // Ya vienen filtradas del hook si searchTerm se usa con filterShippingRules
    loading,
    error,
    deleteShippingRule,
    filterShippingRules,
    // loadShippingRules, // Probablemente no sea necesario llamarlo explícitamente aquí
  } = useShippingRules();

  // Manejar cambio en la búsqueda
  const handleSearchChange = useCallback((event) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterShippingRules(term); // Usar la función del hook para filtrar
  }, [filterShippingRules]);
  
  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    filterShippingRules('');
  }, [filterShippingRules]);

  // Manejar eliminación
  const handleDelete = useCallback(async (ruleId) => {
    // La confirmación ahora está dentro de ShippingTable, se puede quitar de aquí
    // if (window.confirm('¿Estás seguro de que deseas eliminar esta regla de envío?')) {
      try {
        const result = await deleteShippingRule(ruleId);
        if (result && !result.ok) {
          alert(result.error || 'Error al eliminar la regla');
        }
      } catch (err) {
        console.error('Error eliminando regla:', err);
        alert(err.message || 'Error inesperado al eliminar la regla');
      }
    // }
  }, [deleteShippingRule]);

  /**
   * Renderiza solo la barra de búsqueda.
   * @returns {JSX.Element}
   */
  const renderTableActions = () => {
    return (
      // Solo la barra de búsqueda aquí
      <div className="mb-4">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange} 
          onClearSearch={clearSearch}
          placeholder="Buscar por zona..."
          className="flex-grow-1" // Opcional si el div padre no es flex
        />
      </div>
    );
  }

  // Si hay un error general al cargar las reglas iniciales
  if (error && !loading && shippingRules.length === 0) {
    return (
      <div className="alert alert-danger py-2 mb-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error al cargar las reglas de envío: {error}
      </div>
    );
  }

  // Contenedor principal para la vista de tabla
  return (
    <div> 
      {renderTableActions()} 
      <ShippingTable
        rules={shippingRules}
        loading={loading}
        onEdit={onEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
      />
      {/* Renderizar el FAB aquí, independiente de las acciones de la tabla */}
      <CreateButton 
        onClick={onCreateNew} 
        text="Nueva Regla" // El texto se usará como title/tooltip
        isFab={true}
        // fabPositionClasses="position-fixed bottom-0 end-0 m-3" // Usar las clases por defecto o especificar otras
      />
    </div>
  );
}; 