import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Eliminar import de ShippingTable
// import { ShippingTable } from '../table/ShippingTable'; 
import { useShippingRules } from '../hooks/useShippingRules';
// Imports de Common Components
import { SearchBar } from '../../common/components/SearchBar';
import { CreateButton } from '../../common/components/CreateButton';
import { DataTable } from '../../common/components/DataTable'; // Importar DataTable
import { ActionButtonsContainer } from '../../common/components/ActionButtonsContainer';
import { ActionButton } from '../../common/components/ActionButton';
// Imports de Shipping Components (para renderCell)
import { RuleStatusBadge } from '../components/RuleStatusBadge';
import { ShippingMethodsSummary } from '../components/ShippingMethodsSummary';

/**
 * Contenedor para la lógica de la tabla de reglas de envío.
 * Utiliza el componente reutilizable DataTable para mostrar los datos.
 * Maneja la carga, búsqueda, eliminación y ordenación (solo estado) de reglas.
 */
export const ShippingTableContainer = ({ onEdit, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para la configuración de ordenación
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' }); // Orden inicial por nombre ASC

  const {
    // Usar directamente los datos filtrados/totales del hook si es posible
    shippingRules: filteredRulesFromHook, // Cambiar nombre si el hook filtra
    allShippingRules, // Asumir que el hook puede dar todos para ordenar
    loading,
    error,
    deleteShippingRule,
    filterShippingRules, // Función del hook para filtrar
  } = useShippingRules();

  // --- Lógica de Ordenación (Cliente) --- 
  // Ordenar los datos que actualmente se muestran (podrían estar ya filtrados por el hook)
  const sortedAndFilteredRules = useMemo(() => {
    // Usar los datos filtrados del hook si existen, sino todos
    let itemsToProcess = filteredRulesFromHook || allShippingRules || [];
    let sortableItems = [...itemsToProcess]; 
    
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        // Acceder a la propiedad correcta para ordenar
        switch (sortConfig.key) {
          case 'nombre':
            aValue = a.zona?.toLowerCase() || ''; // Ordenar por nombre (zona), case-insensitive
            bValue = b.zona?.toLowerCase() || '';
            break;
          case 'activo': // Ordenar por estado activo/inactivo
            aValue = a.activo;
            bValue = b.activo;
            // Tratar booleanos (true > false)
            if (aValue === bValue) return 0;
            if (sortConfig.direction === 'asc') {
              return aValue ? 1 : -1;
            } else {
              return aValue ? -1 : 1;
            }
          // Añadir más casos si otras columnas son ordenables
          default:
            // Fallback genérico (puede no ser ideal para todos los tipos)
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
            break;
        }

        // Comparación estándar para strings/números (si no se manejó antes como booleano)
        if (typeof aValue !== 'boolean') { 
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRulesFromHook, allShippingRules, sortConfig]); // Depender de los datos relevantes y config de orden


  // --- Callbacks --- 
  const handleSearchChange = useCallback((event) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterShippingRules(term); // Llamar a la función del hook
  }, [filterShippingRules]);
  
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    filterShippingRules('');
  }, [filterShippingRules]);

  const handleDelete = useCallback(async (ruleId) => {
    try {
      const result = await deleteShippingRule(ruleId);
      if (result && !result.ok) {
        alert(result.error || 'Error al eliminar la regla');
      }
      // Asume que el hook actualiza la lista tras eliminar
    } catch (err) {
      console.error('Error eliminando regla:', err);
      alert(err.message || 'Error inesperado al eliminar la regla');
    }
  }, [deleteShippingRule]);

  // Callback para manejar el cambio de ordenación desde DataTable
  const handleSortChange = useCallback((sortKey) => {
    let direction = 'asc';
    if (sortConfig.key === sortKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    } 
    // Si se quiere quitar ordenación al tercer clic:
    // else if (sortConfig.key === sortKey && sortConfig.direction === 'desc') {
    //   direction = null;
    //   sortKey = null;
    // }
    setSortConfig({ key: sortKey, direction });
  }, [sortConfig]);

  // --- Configuración de Columnas para DataTable --- 
  const columns = useMemo(() => [
    {
      key: 'nombre',
      header: 'Nombre',
      isSortable: true,
      renderCell: (rule) => <span className="fw-medium">{rule.zona || 'N/A'}</span>
    },
    {
      key: 'tipo',
      header: 'Tipo',
      isSortable: false, 
      renderCell: (rule) => {
        let coverageType = "CP";
        if (rule.zipcodes && rule.zipcodes.length > 0) {
          if (rule.zipcodes.includes('nacional')) {
            coverageType = "Nacional";
          } else if (rule.zipcodes.some(z => z && typeof z === 'string' && z.startsWith('estado_'))) {
            coverageType = "Regional";
          }
        }
        return <span>{coverageType}</span>;
      }
    },
    {
      key: 'metodos',
      header: 'Métodos',
      isSortable: false,
      renderCell: (rule) => <ShippingMethodsSummary methods={rule.opciones_mensajeria} />
    },
    {
      key: 'activo',
      header: 'Estado',
      isSortable: true,
      renderCell: (rule) => <RuleStatusBadge isActive={rule.activo} />
    },
    {
      key: 'acciones',
      header: <span className="text-end d-block">Acciones</span>, 
      headerClassName: 'text-end', 
      cellClassName: 'text-end',   
      renderCell: (rule) => (
          <ActionButtonsContainer size="sm" ariaLabel={`Acciones para ${rule.zona}`}>
            <ActionButton
              iconClass="bi bi-pencil"
              title="Editar regla"
              onClick={() => onEdit(rule.id)} 
              variant="light"
              textColor="secondary"
              isFirst={true}
            />
            <ActionButton
              iconClass="bi bi-trash"
              title="Eliminar regla"
              onClick={() => handleDelete(rule.id)} 
              confirmMessage={`¿Estás seguro de eliminar la regla para "${rule.zona}"?`}
              variant="light"
              textColor="secondary"
              hoverTextColor="danger"
              isLast={true}
            />
          </ActionButtonsContainer>
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [onEdit, handleDelete, handleSortChange]); // Añadir handleSortChange si afecta a renderCell (ej. pasar sortConfig)


  /**
   * Renderiza solo la barra de búsqueda.
   * @returns {JSX.Element}
   */
  const renderTableActions = () => {
    return (
      <div className="mb-4">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange} 
          onClearSearch={clearSearch}
          placeholder="Buscar por zona..." // Placeholder actualizado
          className="flex-grow-1" // Opcional sin flex padre
        />
      </div>
    );
  }

  // --- Renderizado --- 

  // Mensaje de error global (solo si afecta carga inicial)
  if (error && !loading && !allShippingRules?.length && !searchTerm) {
    return (
      <div className="alert alert-danger py-2 mb-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error al cargar las reglas de envío: {error}
      </div>
    );
  }

  return (
    <div> 
      {renderTableActions()} 

      <DataTable
        // Usar datos ordenados y potencialmente filtrados
        data={sortedAndFilteredRules} 
        columns={columns}
        isLoading={loading}
        keyExtractor={(rule) => rule.id}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        // Pasar props para mensajes de estado vacío / sin resultados
        isFiltered={!!searchTerm} // Indicar a DataTable si hay un filtro activo
        noResultsTitle="No se encontraron reglas"
        noResultsMessage={searchTerm ? `No hay reglas que coincidan con "${searchTerm}"` : undefined}
        emptyStateTitle="No hay reglas de envío creadas"
        emptyStateMessage="Crea tu primera regla de envío para empezar."
      />

      {/* Renderizar el FAB */}
      <CreateButton 
        onClick={onCreateNew} 
        text="Nueva Regla"
        isFab={true}
      />
    </div>
  );
}; 