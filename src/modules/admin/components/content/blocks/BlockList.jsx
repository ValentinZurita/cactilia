import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BlockItem } from '../common/BlockItem.jsx'
import { getBlockConfig } from '../../../utilis/blockRegistry.js'


/**
 * Lista de bloques con soporte para arrastrar y soltar
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.blocks - Lista de bloques a mostrar
 * @param {string} props.selectedBlockId - ID del bloque seleccionado
 * @param {Function} props.onSelectBlock - Función para seleccionar un bloque
 * @param {Function} props.onDeleteBlock - Función para eliminar un bloque
 * @param {Function} props.onReorderBlocks - Función para reordenar los bloques
 * @param {Function} props.onCloneBlock - Función para clonar un bloque
 * @param {Function} props.onMoveBlock - Función para mover un bloque arriba/abajo
 * @returns {JSX.Element}
 */
export const BlockList = ({
                            blocks = [],
                            selectedBlockId,
                            onSelectBlock,
                            onDeleteBlock,
                            onReorderBlocks,
                            onCloneBlock,
                            onMoveBlock
                          }) => {

  // Obtener detalles de un bloque
  const getBlockDetails = (block) => {
    const blockConfig = getBlockConfig(block.type);
    const title = blockConfig?.title || block.type;
    const icon = blockConfig?.icon || 'bi-puzzle';
    return { title, icon };
  };

  // Reordenar bloques
  const reorderBlocks = (blocks, sourceIndex, destinationIndex) => {
    const newOrder = Array.from(blocks);
    const [reorderedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, reorderedItem);
    return newOrder.map(block => block.id);
  };

  // Manejar el final del arrastre
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newOrderIds = reorderBlocks(blocks, result.source.index, result.destination.index);
    onReorderBlocks(newOrderIds);
  };

  // Si no hay bloques, mostrar mensaje
  if (blocks.length === 0) {
    return (
      <div className="p-4 text-center text-muted">
        <i className="bi bi-layout-text-window display-4 d-block mb-3"></i>
        <p>No hay bloques de contenido.</p>
        <p>Añade un bloque para comenzar a diseñar tu página.</p>
      </div>
    );
  }

  return (

    // Contexto de arrastrar y soltar
    <DragDropContext onDragEnd={handleDragEnd}>

      {/* Lista de bloques */}
      <Droppable droppableId="blocks-list">
        {(provided) => (
          <div
            className="blocks-list p-2 overflow-auto"
            style={{ maxHeight: 'calc(100vh - 350px)' }}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >

            {/* Iterar sobre los bloques */}
            {blocks.map((block, index) => {
              const { title, icon } = getBlockDetails(block);
              return (

                // Bloque arrastrable
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >

                      {/* Elemento de bloque */}
                      <BlockItem
                        block={block}
                        title={title}
                        icon={icon}
                        isSelected={selectedBlockId === block.id}
                        onClick={() => onSelectBlock(block.id)}
                        onDelete={() => onDeleteBlock(block.id)}
                        onClone={() => onCloneBlock(block.id)}
                        onMoveUp={() => onMoveBlock(block.id, -1)}
                        onMoveDown={() => onMoveBlock(block.id, 1)}
                        isFirst={index === 0}
                        isLast={index === blocks.length - 1}
                      />
                    </div>
                  )}
                </Draggable>

              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

    </DragDropContext>
  );
};