import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BLOCK_TYPES, BLOCK_SCHEMAS } from '../../services/contentService';
import { Spinner } from '../../../../shared/components/spinner/Spinner';
import { MediaSelector } from '../media/index.js';
import { BlockEditor } from './BlockEditor';

/**
 * Componente principal para gestionar el contenido de una página
 * Versión mejorada con mejor interfaz y experiencia de usuario
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.pageContentHook - Hook con los datos y métodos para gestionar el contenido
 * @returns {JSX.Element}
 */
export const PageContentManager = ({ pageContentHook }) => {
  // Estados locales
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [selectedMediaField, setSelectedMediaField] = useState(null);
  const [newBlockType, setNewBlockType] = useState('');

  // Extraer datos y métodos del hook
  const {
    blocks,
    loading,
    error,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks
  } = pageContentHook;

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
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-layout-text-window me-2 text-primary"></i>
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
                                className={`block-item p-3 mb-2 border rounded ${selectedBlockId === block.id ? 'border-primary bg-light' : 'border-light'}`}
                                onClick={() => setSelectedBlockId(block.id)}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-grip-vertical text-muted me-2"></i>
                                    {getBlockIcon(block.type)}
                                    <span className="fw-medium ms-2">
                                      {BLOCK_SCHEMAS[block.type]?.title || block.type}
                                    </span>
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger rounded-circle"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteBlock(block.id);
                                      }}
                                      title="Eliminar bloque"
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

            {/* Guía rápida para usar los bloques */}
            <div className="card-footer bg-white border-top p-3">
              <div className="alert alert-light mb-0 p-2">
                <p className="mb-1 small">
                  <i className="bi bi-info-circle-fill text-primary me-1"></i>
                  <strong>Consejos de uso:</strong>
                </p>
                <ul className="mb-0 ps-3 small">
                  <li>Arrastra los bloques para reordenarlos</li>
                  <li>Haz clic en un bloque para editarlo</li>
                  <li>Utiliza el botón flotante para guardar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Editor del bloque seleccionado */}
        <div className="col-md-8">
          {selectedBlock ? (
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-pencil-square me-2 text-primary"></i>
                  Editar: {BLOCK_SCHEMAS[selectedBlock.type]?.title || selectedBlock.type}
                </h5>
              </div>

              <div className="card-body">
                {/* Editor de campos */}
                {selectedBlock.type && BLOCK_SCHEMAS[selectedBlock.type] ? (
                  <BlockEditor
                    block={selectedBlock}
                    onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
                    onOpenMediaSelector={handleOpenMediaSelector}
                  />
                ) : (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    No se encontró configuración para este tipo de bloque.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm h-100">
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

/**
 * Devuelve el icono correspondiente al tipo de bloque
 * @param {string} blockType - Tipo de bloque
 * @returns {JSX.Element} - Icono
 */
const getBlockIcon = (blockType) => {
  const iconMap = {
    'hero-slider': <i className="bi bi-images text-info"></i>,
    'featured-products': <i className="bi bi-star text-warning"></i>,
    'image-carousel': <i className="bi bi-card-image text-success"></i>,
    'product-categories': <i className="bi bi-grid text-primary"></i>,
    'text-block': <i className="bi bi-file-text text-secondary"></i>,
    'call-to-action': <i className="bi bi-megaphone text-danger"></i>
  };

  return iconMap[blockType] || <i className="bi bi-puzzle text-muted"></i>;
};