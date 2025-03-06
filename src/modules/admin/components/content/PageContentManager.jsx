import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { usePageContent } from '../../hooks/usePageContent';
import { BLOCK_TYPES, BLOCK_SCHEMAS } from '../../services/contentService';
import { Spinner } from '../../../../shared/components/spinner/Spinner';
import { MediaSelector } from '../media/index.js'


/**
 * Componente principal para gestionar el contenido de una página
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.pageId - ID de la página a gestionar
 * @returns {JSX.Element}
 */
export const PageContentManager = ({ pageId = 'home' }) => {
  // Estados locales
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [selectedMediaField, setSelectedMediaField] = useState(null);
  const [newBlockType, setNewBlockType] = useState('');

  // Hook de gestión de contenido
  const {
    blocks,
    loading,
    error,
    selectedBlockId,
    setSelectedBlockId,
    loadPageContent,
    savePageContent,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks
  } = usePageContent(pageId);

  // Obtener el bloque seleccionado
  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  // Manejar selección de imagen de la librería de medios
  const handleMediaSelect = (media) => {
    if (!selectedBlockId || !selectedMediaField) return;

    // Actualizar el bloque con la imagen seleccionada
    updateBlock(selectedBlockId, {
      [selectedMediaField]: media.url
    });

    // Cerrar selector
    setIsMediaSelectorOpen(false);
    setSelectedMediaField(null);
  };

  // Manejar apertura del selector de medios
  const handleOpenMediaSelector = (fieldName) => {
    setSelectedMediaField(fieldName);
    setIsMediaSelectorOpen(true);
  };

  // Manejar cambio de posición por drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newOrder = Array.from(blocks);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    // Reordenar bloques
    reorderBlocks(newOrder.map(block => block.id));
  };

  // Manejar creación de un nuevo bloque
  const handleAddBlock = () => {
    if (!newBlockType) {
      alert('Por favor selecciona un tipo de bloque');
      return;
    }

    // Añadir bloque
    addBlock(newBlockType);

    // Limpiar selección
    setNewBlockType('');
  };

  // Manejador de cambios en los campos del bloque
  const handleBlockFieldChange = (field, value) => {
    if (!selectedBlockId) return;

    // Actualizar el campo del bloque
    const updates = { [field]: value };
    updateBlock(selectedBlockId, updates);
  };

  // Renderizar editor de campos según el tipo de campo
  const renderFieldEditor = (fieldName, fieldConfig, currentValue) => {
    const { type, label, options, defaultValue } = fieldConfig;
    const value = currentValue || defaultValue || '';

    switch (type) {
      case 'text':
        return (
          <div className="mb-3" key={fieldName}>
            <label className="form-label">{label}</label>
            <input
              type="text"
              className="form-control"
              value={value}
              onChange={(e) => handleBlockFieldChange(fieldName, e.target.value)}
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="mb-3" key={fieldName}>
            <label className="form-label">{label}</label>
            <textarea
              className="form-control"
              rows="3"
              value={value}
              onChange={(e) => handleBlockFieldChange(fieldName, e.target.value)}
            ></textarea>
          </div>
        );

      case 'select':
        return (
          <div className="mb-3" key={fieldName}>
            <label className="form-label">{label}</label>
            <select
              className="form-select"
              value={value}
              onChange={(e) => handleBlockFieldChange(fieldName, e.target.value)}
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'boolean':
        return (
          <div className="mb-3 form-check" key={fieldName}>
            <input
              type="checkbox"
              className="form-check-input"
              id={`${selectedBlockId}-${fieldName}`}
              checked={!!value}
              onChange={(e) => handleBlockFieldChange(fieldName, e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`${selectedBlockId}-${fieldName}`}>
              {label}
            </label>
          </div>
        );

      case 'number':
        return (
          <div className="mb-3" key={fieldName}>
            <label className="form-label">{label}</label>
            <input
              type="number"
              className="form-control"
              value={value}
              onChange={(e) => handleBlockFieldChange(fieldName, parseInt(e.target.value) || 0)}
            />
          </div>
        );

      case 'media':
      case 'collection':
        return (
          <div className="mb-3" key={fieldName}>
            <label className="form-label">{label}</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={value}
                readOnly
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleOpenMediaSelector(fieldName)}
              >
                <i className="bi bi-images me-1"></i>
                Seleccionar
              </button>
            </div>
            {value && type === 'media' && (
              <div className="mt-2">
                <img
                  src={value}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxHeight: '100px' }}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mb-3" key={fieldName}>
            <label className="form-label">{label}</label>
            <input
              type="text"
              className="form-control"
              value={value}
              onChange={(e) => handleBlockFieldChange(fieldName, e.target.value)}
            />
          </div>
        );
    }
  };

  // Si está cargando
  if (loading && blocks.length === 0) {
    return (
      <div className="text-center p-5">
        <Spinner />
        <p className="mt-3 text-muted">Cargando contenido de la página...</p>
      </div>
    );
  }

  // Si hay error
  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="content-manager">
      <div className="row g-4">
        {/* Columna izquierda: Lista de bloques y opciones */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-layout-text-window me-2"></i>
                Bloques de Contenido
              </h5>
            </div>

            <div className="card-body p-0">
              {/* Lista de bloques actuales */}
              {blocks.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="blocks-list">
                    {(provided) => (
                      <div
                        className="blocks-list p-2"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {blocks.map((block, index) => (
                          <Draggable
                            key={block.id}
                            draggableId={block.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`block-item p-3 mb-2 border rounded ${selectedBlockId === block.id ? 'border-primary' : 'border-light'}`}
                                onClick={() => setSelectedBlockId(block.id)}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <i className="bi bi-grip-vertical text-muted me-2"></i>
                                    <span className="fw-medium">
                                      {BLOCK_SCHEMAS[block.type]?.title || block.type}
                                    </span>
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteBlock(block.id);
                                      }}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-layout-text-window display-4 d-block mb-3"></i>
                  <p>No hay bloques de contenido.</p>
                  <p>Añade un bloque para comenzar a diseñar tu página.</p>
                </div>
              )}

              {/* Añadir nuevo bloque */}
              <div className="p-3 border-top">
                <div className="d-flex">
                  <select
                    className="form-select me-2"
                    value={newBlockType}
                    onChange={(e) => setNewBlockType(e.target.value)}
                  >
                    <option value="">Seleccionar tipo de bloque</option>
                    {Object.entries(BLOCK_SCHEMAS).map(([type, schema]) => (
                      <option key={type} value={type}>
                        {schema.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddBlock}
                    disabled={!newBlockType}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="card-footer bg-white border-top p-3">
              <div className="d-grid">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={savePageContent}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Editor del bloque seleccionado */}
        <div className="col-md-8">
          {selectedBlock ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-pencil-square me-2"></i>
                  Editar: {BLOCK_SCHEMAS[selectedBlock.type]?.title || selectedBlock.type}
                </h5>
              </div>

              <div className="card-body">
                {/* Editor de campos */}
                {selectedBlock.type && BLOCK_SCHEMAS[selectedBlock.type] ? (
                  <form>
                    {Object.entries(BLOCK_SCHEMAS[selectedBlock.type].fields).map(([fieldName, fieldConfig]) =>
                      renderFieldEditor(fieldName, fieldConfig, selectedBlock[fieldName])
                    )}
                  </form>
                ) : (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    No se encontró configuración para este tipo de bloque.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <i className="bi bi-arrow-left-circle display-4 text-muted mb-3"></i>
                <h4>Selecciona un bloque</h4>
                <p className="text-muted">
                  Selecciona un bloque de la lista para editarlo o añade uno nuevo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selector de medios */}
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={handleMediaSelect}
        title={`Seleccionar ${selectedMediaField === 'collectionId' ? 'colección' : 'imagen'}`}
      />
    </div>
  );
};