import React, { useEffect } from 'react';
import { BLOCK_SCHEMAS } from '../../services/contentService';
import { CollectionsManager } from '../media/index.js';

/**
 * Editor de propiedades para un bloque de contenido
 * Versión mejorada con soporte para carga dinámica de colecciones
 *
 * @param {Object} props
 * @param {Object} props.block - Bloque a editar
 * @param {Function} props.onUpdate - Función a llamar cuando se actualice un campo
 * @param {Function} props.onOpenMediaSelector - Función para abrir el selector de medios
 * @param {Function} props.onUpdateCollectionImages - Función para cargar imágenes de colección
 * @returns {JSX.Element}
 */
export const BlockEditor = ({ block, onUpdate, onOpenMediaSelector, onUpdateCollectionImages }) => {
  // Obtener el esquema del bloque
  const schema = BLOCK_SCHEMAS[block.type] || null;

  // Si no hay esquema, mostrar mensaje de error
  if (!schema) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        No se encontró un esquema para el tipo de bloque "{block.type}"
      </div>
    );
  }

  // Efecto para cargar imágenes cuando cambia la colección
  useEffect(() => {
    if (block.collectionId && onUpdateCollectionImages) {
      onUpdateCollectionImages(block.collectionId);
    }
  }, [block.collectionId, onUpdateCollectionImages]);

  // Manejar cambio en un campo
  const handleFieldChange = (fieldName, value) => {
    // Si estamos cambiando useCollection y activándolo, asegurarnos que filterByFeatured se desactive
    if (fieldName === 'useCollection' && value === true) {
      onUpdate({ [fieldName]: value, filterByFeatured: false });
      return;
    }

    // Si estamos cambiando filterByFeatured y activándolo, asegurarnos que useCollection se desactive
    if (fieldName === 'filterByFeatured' && value === true) {
      onUpdate({ [fieldName]: value, useCollection: false });
      return;
    }

    onUpdate({ [fieldName]: value });
  };

  // Renderizar campo según su tipo
  const renderField = (fieldName, fieldSchema) => {
    const fieldValue = block[fieldName] !== undefined ? block[fieldName] : fieldSchema.defaultValue || '';

    // Mostrar u ocultar campos condicionales
    const shouldShow = (condition) => {
      if (!condition) return true;

      // Evaluar la condición (por ejemplo 'useCollection === true')
      const [dependsOn, requiredValue] = condition.split(' === ');
      return String(block[dependsOn]) === requiredValue;
    };

    // Si hay una condición de visualización definida y no se cumple, no mostrar el campo
    if (fieldSchema.showIf && !shouldShow(fieldSchema.showIf)) {
      return null;
    }

    switch (fieldSchema.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-control"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder || fieldSchema.label}
          />
        );

      case 'textarea':
        return (
          <textarea
            className="form-control"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder || fieldSchema.label}
            rows={5}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-control"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, Number(e.target.value))}
            placeholder={fieldSchema.placeholder || fieldSchema.label}
            min={fieldSchema.min}
            max={fieldSchema.max}
            step={fieldSchema.step || 1}
          />
        );

      case 'boolean':
        return (
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={!!fieldValue}
              onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
              id={`field-${fieldName}`}
            />
            <label className="form-check-label" htmlFor={`field-${fieldName}`}>
              {fieldValue ? 'Sí' : 'No'}
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            className="form-select"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          >
            {fieldSchema.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'media':
        return (
          <div>
            {fieldValue ? (
              <div className="media-preview mb-2">
                <img
                  src={fieldValue}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxHeight: '150px', maxWidth: '100%' }}
                />
              </div>
            ) : (
              <div className="no-media-placeholder mb-2 p-3 bg-light text-center rounded">
                <i className="bi bi-image text-muted fs-3 d-block"></i>
                <small className="text-muted">No hay imagen seleccionada</small>
              </div>
            )}

            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={() => onOpenMediaSelector(fieldName)}
            >
              <i className="bi bi-images me-2"></i>
              {fieldValue ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </button>

            {fieldValue && (
              <button
                className="btn btn-outline-danger ms-2"
                type="button"
                onClick={() => handleFieldChange(fieldName, null)}
                title="Quitar imagen"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        );

      case 'collection':
        return (
          <div>
            <CollectionsManager
              selectedCollectionId={fieldValue}
              onSelectCollection={(collectionId) => handleFieldChange(fieldName, collectionId)}
              hideTitle={true}
            />
          </div>
        );

      default:
        return (
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Tipo de campo no soportado: {fieldSchema.type}
          </div>
        );
    }
  };

  return (
    <div className="block-editor">
      {Object.entries(schema.fields).map(([fieldName, fieldSchema]) => (
        <div className="mb-3" key={fieldName}>
          <label className="form-label">
            {fieldSchema.label}
            {fieldSchema.required && <span className="text-danger ms-1">*</span>}
          </label>
          {renderField(fieldName, fieldSchema)}
          {fieldSchema.help && (
            <div className="form-text text-muted small">{fieldSchema.help}</div>
          )}
        </div>
      ))}
    </div>
  );
};