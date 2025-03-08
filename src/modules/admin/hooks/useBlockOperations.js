import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook personalizado para gestionar operaciones con bloques
 * Centraliza la lógica para añadir, actualizar, eliminar y reordenar bloques
 */
export const useBlockOperations = ({ blocks, setBlocks, selectedBlockId, setSelectedBlockId }) => {

  /**
   * Añade un nuevo bloque al final de la lista
   * @param {string} blockType - Tipo de bloque a añadir
   * @param {Object} initialData - Datos iniciales para el bloque (opcional)
   * @returns {string} - ID del nuevo bloque
   */
  const addBlock = useCallback((blockType, initialData = {}) => {
    // Crear un ID único para el bloque
    const blockId = `block_${blockType.replace(/-/g, '_')}_${uuidv4().slice(0, 8)}`;

    // Crear el nuevo bloque con datos básicos
    const newBlock = {
      id: blockId,
      type: blockType,
      ...initialData,
      createdAt: new Date().toISOString()
    };

    // Añadir el bloque a la lista
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);

    // Seleccionar el nuevo bloque para edición
    setSelectedBlockId(blockId);

    return blockId;
  }, [setBlocks, setSelectedBlockId]);

  /**
   * Actualiza un bloque existente
   * @param {string} blockId - ID del bloque a actualizar
   * @param {Object} updates - Cambios a aplicar al bloque
   */
  const updateBlock = useCallback((blockId, updates) => {
    setBlocks(prevBlocks => {
      // Buscar el bloque en la lista
      const blockIndex = prevBlocks.findIndex(b => b.id === blockId);

      if (blockIndex === -1) {
        console.warn(`Block with ID ${blockId} not found`);
        return prevBlocks;
      }

      // Crear una nueva lista con el bloque actualizado
      const updatedBlocks = [...prevBlocks];
      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return updatedBlocks;
    });
  }, [setBlocks]);

  /**
   * Elimina un bloque
   * @param {string} blockId - ID del bloque a eliminar
   */
  const deleteBlock = useCallback((blockId) => {
    // Pedir confirmación antes de eliminar
    if (!window.confirm("¿Estás seguro de eliminar este bloque?")) {
      return;
    }

    // Filtrar el bloque de la lista
    setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== blockId));

    // Si el bloque eliminado era el seleccionado, limpiar selección
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId, setBlocks, setSelectedBlockId]);

  /**
   * Reordena los bloques
   * @param {Array} newOrder - Array de IDs en el nuevo orden
   */
  const reorderBlocks = useCallback((newOrder) => {
    setBlocks(prevBlocks => {
      // Crear un mapa para acceder rápidamente a los bloques por ID
      const blocksMap = prevBlocks.reduce((map, block) => {
        map[block.id] = block;
        return map;
      }, {});

      // Crear nuevo array ordenado
      return newOrder
        .filter(id => blocksMap[id]) // Solo incluir IDs válidos
        .map(id => blocksMap[id]);
    });
  }, [setBlocks]);

  /**
   * Clona un bloque existente
   * @param {string} blockId - ID del bloque a clonar
   * @returns {string|null} - ID del nuevo bloque o null si falla
   */
  const cloneBlock = useCallback((blockId) => {
    const block = blocks.find(b => b.id === blockId);

    if (!block) {
      console.warn(`Block with ID ${blockId} not found`);
      return null;
    }

    // Crear una copia del bloque con un nuevo ID
    const { id, createdAt, updatedAt, ...blockData } = block;

    return addBlock(block.type, {
      ...blockData,
      title: blockData.title ? `${blockData.title} (Copia)` : 'Copia'
    });
  }, [blocks, addBlock]);

  /**
   * Mueve un bloque arriba o abajo en la lista
   * @param {string} blockId - ID del bloque a mover
   * @param {number} direction - 1 para mover hacia abajo, -1 para mover hacia arriba
   */
  const moveBlock = useCallback((blockId, direction) => {
    setBlocks(prevBlocks => {
      const index = prevBlocks.findIndex(b => b.id === blockId);

      if (index === -1) return prevBlocks;

      // Calcular nueva posición
      const newIndex = index + direction;

      // Verificar límites
      if (newIndex < 0 || newIndex >= prevBlocks.length) {
        return prevBlocks;
      }

      // Crear una copia y hacer el intercambio
      const newBlocks = [...prevBlocks];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

      return newBlocks;
    });
  }, [setBlocks]);

  return {
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    cloneBlock,
    moveBlock
  };
};