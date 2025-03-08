import React, { useState } from 'react';
import { useBlockOperations } from '../../../hooks/useBlockOperations.js'
import { getAllBlockTypes } from '../../../utilis/blockRegistry.js'
import { BlockEditorFactory } from '../BlockEditorFactory.jsx'
import { MediaSelector } from '../../media/index.js'
import { BlockList } from './BlockList.jsx'


/**
 * Editor principal de contenido
 * Gestiona la lista de bloques y el panel de edición
 * Actualizado para manejar selección de colecciones correctamente
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.contentHook - Hook con los datos y métodos para gestionar el contenido
 * @returns {JSX.Element}
 */
export const ContentEditor = ({ contentHook }) => {
  // Estados locales
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [selectedMediaField, setSelectedMediaField] = useState(null);
  const [isCollection, setIsCollection] = useState(false); // Nuevo estado para identificar si es colección
  const [newBlockType, setNewBlockType] = useState('');

  // Extraer datos y métodos del hook de contenido
  const {
    blocks,
    loading,
    error,
    selectedBlockId,
    setSelectedBlockId,
  } = contentHook;

  // Operaciones con bloques
  const blockOperations = useBlockOperations({
    blocks,
    setBlocks: contentHook.setBlocks,
    selectedBlockId,
    setSelectedBlockId
  });

  // Obtener el bloque seleccionado
  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  // Manejar selección de imagen/colección de la librería de medios
  const handleMediaSelect = (media) => {
    if (!selectedBlockId || !selectedMediaField) return;

    // Actualizar el bloque con el valor seleccionado
    // Si es colección, usamos su ID, si es imagen usamos la URL
    const value = isCollection ? media.id : media.url;

    blockOperations.updateBlock(selectedBlockId, {
      [selectedMediaField]: value
    });

    // Cerrar selector
    setIsMediaSelectorOpen(false);
    setSelectedMediaField(null);
    setIsCollection(false);
  };

  // Manejar apertura del selector de medios
  const handleOpenMediaSelector = (fieldName, isCollectionField = false) => {
    setSelectedMediaField(fieldName);
    setIsCollection(isCollectionField); // Guardar si estamos seleccionando una colección
    setIsMediaSelectorOpen(true);
  };

  // Manejar creación de un nuevo bloque
  const handleAddBlock = () => {
    if (!newBlockType) {
      alert('Por favor selecciona un tipo de bloque');
      return;
    }

    // Añadir bloque
    blockOperations.addBlock(newBlockType);

    // Limpiar selección
    setNewBlockType('');
  };

  // Si está cargando
  if (loading && blocks.length === 0) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
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

  // Obtener todos los tipos de bloques disponibles
  const availableBlockTypes = getAllBlockTypes();

  return (
    <div className="content-editor">
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
              <BlockList
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onDeleteBlock={blockOperations.deleteBlock}
                onReorderBlocks={blockOperations.reorderBlocks}
                onCloneBlock={blockOperations.cloneBlock}
                onMoveBlock={blockOperations.moveBlock}
              />

              {/* Añadir nuevo bloque */}
              <div className="p-3 border-top">
                <div className="d-flex">
                  <select
                    className="form-select me-2"
                    value={newBlockType}
                    onChange={(e) => setNewBlockType(e.target.value)}
                  >
                    <option value="">Seleccionar tipo de bloque</option>
                    {availableBlockTypes.map((blockType) => (
                      <option key={blockType.type} value={blockType.type}>
                        {blockType.title}
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
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-pencil-square me-2 text-primary"></i>
                {selectedBlock
                  ? `Editar: ${availableBlockTypes.find(bt => bt.type === selectedBlock.type)?.title || selectedBlock.type}`
                  : 'Editor de Bloques'
                }
              </h5>
            </div>

            <div className="card-body">
              {/* Editor de campos */}
              <BlockEditorFactory
                block={selectedBlock}
                onUpdate={(updates) => blockOperations.updateBlock(selectedBlockId, updates)}
                onMediaSelect={handleOpenMediaSelector}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selector de medios (modificado para manejar colecciones) */}
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => {
          setIsMediaSelectorOpen(false);
          setSelectedMediaField(null);
          setIsCollection(false);
        }}
        onSelect={handleMediaSelect}
        title={`Seleccionar ${isCollection ? 'colección' : 'imagen'}`}
        // Pasar flag que indique si buscamos colecciones o imágenes individuales
        selectCollection={isCollection}
      />
    </div>
  );
};