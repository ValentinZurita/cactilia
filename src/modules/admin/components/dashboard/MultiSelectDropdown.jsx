import React, { useState, useEffect } from 'react';
import { useController } from 'react-hook-form';
import { useDynamicList } from '../../hooks/useDynamicList.js';

/**
 * Componente de dropdown con selección múltiple.
 * Permite seleccionar múltiples opciones de una lista dinámica.
 *
 * @param {string} name - Nombre del campo
 * @param {string} label - Etiqueta del campo
 * @param {Object} control - Objeto control de react-hook-form
 * @param {Function} fetchFunction - Función para obtener los datos dinámicos
 * @param {Object} rules - Reglas de validación (opcional)
 * @param {Array} defaultValue - Valor por defecto (array de IDs)
 * @param {string} helperText - Texto de ayuda para mostrar debajo del campo
 *
 * @returns {JSX.Element}
 */
export const MultiSelectDropdown = ({ 
  name, 
  label, 
  control, 
  fetchFunction, 
  rules = {}, 
  defaultValue = [],
  helperText
}) => {
  const { items, loading } = useDynamicList(fetchFunction);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentSelection, setCurrentSelection] = useState('');
  
  const {
    field,
    fieldState: { error }
  } = useController({ 
    name, 
    control, 
    rules: { 
      required: rules.required !== false ? 'Este campo es requerido' : false,
      ...rules 
    },
    defaultValue: defaultValue
  });

  // Actualizar los items seleccionados cuando cambia el campo
  useEffect(() => {
    if (field.value && Array.isArray(field.value)) {
      setSelectedItems(field.value);
    }
  }, [field.value]);
  
  // Determinar si el campo es opcional
  const isOptional = rules.required === false;
  
  // Manejar selección de una opción individual
  const handleSelectionChange = (e) => {
    setCurrentSelection(e.target.value);
  };
  
  // Agregar una regla a la selección
  const addRule = () => {
    if (!currentSelection) return;
    
    // Evitar duplicados
    if (!selectedItems.includes(currentSelection)) {
      const newItems = [...selectedItems, currentSelection];
      setSelectedItems(newItems);
      field.onChange(newItems);
    }
    
    // Resetear selección actual
    setCurrentSelection('');
  };
  
  // Eliminar una regla de la selección
  const removeRule = (itemId) => {
    const newSelection = selectedItems.filter(id => id !== itemId);
    setSelectedItems(newSelection);
    field.onChange(newSelection);
  };

  // Obtener nombre de un item por su ID
  const getItemName = (itemId) => {
    const item = items.find(i => i.id === itemId);
    return item?.name || 'Elemento desconocido';
  };

  return (
    <div className="mb-3">
      {/* Label */}
      <label className="form-label" htmlFor={name}>
        {label}
        {isOptional && <span className="text-muted ms-1">(opcional)</span>}
        {!isOptional && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Select field con botón de agregar */}
      {loading ? (
        <div className="text-secondary">Cargando datos...</div>
      ) : (
        <>
          <div className="input-group mb-2">
            <select 
              id={name} 
              className={`form-select ${error ? 'is-invalid' : ''}`} 
              value={currentSelection}
              onChange={handleSelectionChange}
              aria-label="Seleccionar regla"
            >
              <option value="">Seleccione una opción</option>
              {items
                .filter(item => !selectedItems.includes(item.id))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              }
            </select>
            <button 
              type="button" 
              className="btn btn-outline-success" 
              onClick={addRule}
              disabled={!currentSelection}
            >
              <i className="bi bi-plus-lg"></i> Agregar
            </button>
          </div>
          
          {/* Lista de elementos seleccionados */}
          {selectedItems.length > 0 ? (
            <div className="mb-1">
              <div className="fs-6 mb-2">Reglas de envío seleccionadas:</div>
              <div className="list-group">
                {selectedItems.map(itemId => (
                  <div 
                    key={itemId} 
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <span>{getItemName(itemId)}</span>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeRule(itemId)}
                      aria-label="Eliminar regla"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="alert alert-warning py-2">
              No hay reglas de envío seleccionadas. Añada al menos una.
            </div>
          )}
        </>
      )}

      {/* Helper text */}
      {helperText && <div className="form-text">{helperText}</div>}
      
      {/* Error message */}
      {error && <div className="invalid-feedback d-block">{error.message}</div>}
      
      {/* Hidden input para asegurar que el valor se envía correctamente */}
      <input 
        type="hidden" 
        name={`${name}_json`} 
        value={JSON.stringify(selectedItems)} 
      />
    </div>
  );
}; 