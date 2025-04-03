import React, { useState } from 'react';
import { useShippingRules } from './hooks/useShippingRules';
import { 
  ShippingRulesTable, 
  SearchBar, 
  EmptyState 
} from './components/table';

/**
 * Componente principal para la gestión de reglas de envío
 * Maneja la visualización de reglas, búsqueda, y redirección a crear/editar
 */
const ShippingManagement = () => {
  // Usar el hook para acceder a las reglas y funciones
  const { 
    rules, 
    loading, 
    error, 
    searchTerm,
    handleSearchChange,
    deleteRule
  } = useShippingRules();
  
  // Estado para mostrar loading states específicos
  const [isDeleting, setIsDeleting] = useState(false);
  
  /**
   * Manejar edición de regla
   * @param {string} id - ID de la regla
   */
  const handleEditRule = (id) => {
    // Redireccionar a la página de edición
    window.location.href = `/admin/shipping/edit/${id}`;
  };
  
  /**
   * Manejar eliminación de regla
   * @param {string} id - ID de la regla
   */
  const handleDeleteRule = async (id) => {
    if (!id) return;
    
    setIsDeleting(true);
    
    try {
      await deleteRule(id);
    } catch (err) {
      console.error('Error al eliminar regla:', err);
      alert(`Error al eliminar la regla: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  /**
   * Manejar creación de nueva regla
   */
  const handleAddNewRule = () => {
    // Redireccionar a la página de creación
    window.location.href = '/admin/shipping/create';
  };
  
  // Determinar qué contenido mostrar
  const showTable = !loading && rules.length > 0;
  const showNoResults = !loading && searchTerm && rules.length === 0;
  const showNoRules = !loading && !searchTerm && rules.length === 0;
  
  return (
    <section className="shipping-management py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">Reglas de Envío</h1>
          <p className="text-muted mb-0">
            Administra las reglas de envío para diferentes zonas geográficas
          </p>
        </div>
        
        <button
          className="btn btn-dark"
          onClick={handleAddNewRule}
          disabled={loading || isDeleting}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nueva Regla
        </button>
      </header>
      
      {/* Barra de búsqueda */}
      <SearchBar
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Buscar por zona, código postal o mensajería..."
      />
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      
      {/* Mostrar spinner durante la carga */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando reglas de envío...</p>
        </div>
      )}
      
      {/* Mostrar tabla si hay reglas */}
      {showTable && (
        <ShippingRulesTable 
          rules={rules}
          onEdit={handleEditRule}
          onDelete={handleDeleteRule}
        />
      )}
      
      {/* Mostrar estado vacío si no hay resultados de búsqueda */}
      {showNoResults && (
        <EmptyState type="noResults" />
      )}
      
      {/* Mostrar estado vacío si no hay reglas */}
      {showNoRules && (
        <EmptyState 
          type="noRules" 
          onAddNew={handleAddNewRule}
        />
      )}
    </section>
  );
};

export default ShippingManagement; 