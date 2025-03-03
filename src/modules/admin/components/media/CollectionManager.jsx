import { useState, useEffect } from 'react';
import { CollectionsModal } from './CollectionsModal.jsx';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getMediaByCollection
} from '../../services/collectionsService';
import { addMessage } from '../../../../store/messages/messageSlice';
import { useDispatch } from 'react-redux';

/**
 * Componente para gestionar colecciones de imágenes
 * Permite crear, editar, eliminar y seleccionar colecciones
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.selectedCollectionId] - ID de la colección seleccionada
 * @param {Function} [props.onSelectCollection] - Callback al seleccionar una colección
 * @returns {JSX.Element}
 */
export const CollectionsManager = ({
                                     selectedCollectionId,
                                     onSelectCollection
                                   }) => {
  // Estado para lista de colecciones
  const [collections, setCollections] = useState([]);

  // Estado para la colección seleccionada para editar
  const [editingCollection, setEditingCollection] = useState(null);

  // Estado para visualización del modal
  const [showModal, setShowModal] = useState(false);

  // Estado para la carga de datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el conteo de imágenes por colección
  const [mediaCount, setMediaCount] = useState({});

  // Redux dispatch para mensajes
  const dispatch = useDispatch();

  // Cargar colecciones al montar el componente
  useEffect(() => {
    loadCollections();
  }, []);

  // Cargar conteo de media para cada colección
  useEffect(() => {
    if (collections.length > 0) {
      loadMediaCounts();
    }
  }, [collections]);

  /**
   * Carga la lista de colecciones disponibles
   */
  const loadCollections = async () => {
    try {
      setLoading(true);
      const result = await getCollections();

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar colecciones');
      }

      setCollections(result.data);
      setError(null);
    } catch (err) {
      console.error('Error cargando colecciones:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error cargando colecciones: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga el conteo de imágenes para cada colección
   */
  const loadMediaCounts = async () => {
    const counts = {};

    for (const collection of collections) {
      try {
        const result = await getMediaByCollection(collection.id);
        if (result.ok) {
          counts[collection.id] = result.data.length;
        }
      } catch (err) {
        console.error(`Error obteniendo media para colección ${collection.id}:`, err);
      }
    }

    setMediaCount(counts);
  };

  /**
   * Guarda una colección (crea nueva o actualiza existente)
   * @param {string} collectionId - ID de la colección a actualizar (null para crear)
   * @param {Object} collectionData - Datos de la colección
   */
  const handleSaveCollection = async (collectionId, collectionData) => {
    try {
      setLoading(true);

      let result;
      if (collectionId) {
        // Actualizar colección existente
        result = await updateCollection(collectionId, collectionData);
        if (result.ok) {
          dispatch(addMessage({
            type: 'success',
            text: 'Colección actualizada con éxito'
          }));
        }
      } else {
        // Crear nueva colección
        result = await createCollection(collectionData);
        if (result.ok) {
          dispatch(addMessage({
            type: 'success',
            text: 'Colección creada con éxito'
          }));
        }
      }

      if (!result.ok) {
        throw new Error(result.error || 'Error al guardar colección');
      }

      // Recargar colecciones
      await loadCollections();

    } catch (err) {
      console.error('Error guardando colección:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error al guardar colección: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una colección
   * @param {string} collectionId - ID de la colección a eliminar
   */
  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta colección? Las imágenes no se eliminarán, pero perderán su asociación con esta colección.')) {
      return;
    }

    try {
      setLoading(true);

      const result = await deleteCollection(collectionId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar colección');
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Colección eliminada con éxito'
      }));

      // Si la colección eliminada era la seleccionada, resetearla
      if (selectedCollectionId === collectionId && onSelectCollection) {
        onSelectCollection(null);
      }

      // Recargar colecciones
      await loadCollections();

    } catch (err) {
      console.error('Error eliminando colección:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error al eliminar colección: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal para editar colección
   * @param {Object} collection - Colección a editar
   */
  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setShowModal(true);
  };

  /**
   * Abrir modal para crear nueva colección
   */
  const handleNewCollection = () => {
    setEditingCollection(null);
    setShowModal(true);
  };

  /**
   * Seleccionar una colección como filtro
   * @param {string} collectionId - ID de la colección a seleccionar
   */
  const handleSelectCollection = (collectionId) => {
    if (onSelectCollection) {
      onSelectCollection(collectionId);
    }
  };

  return (
    <div className="collections-manager mb-4">
      {/* Cabecera con título y botón para nueva colección */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Colecciones</h5>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleNewCollection}
          disabled={loading}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Nueva Colección
        </button>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Lista de colecciones */}
      <div className="list-group collections-list">
        {/* Opción "Todas" */}
        <button
          type="button"
          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${!selectedCollectionId ? 'active' : ''}`}
          onClick={() => handleSelectCollection(null)}
        >
          <span>
            <i className="bi bi-collection me-2"></i>
            Todas las imágenes
          </span>
        </button>

        {/* Lista de colecciones cargadas */}
        {loading && collections.length === 0 ? (
          <div className="list-group-item text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            Cargando colecciones...
          </div>
        ) : collections.length === 0 ? (
          <div className="list-group-item text-center py-3 text-muted">
            <i className="bi bi-info-circle me-2"></i>
            No hay colecciones. Crea una para organizar tus imágenes.
          </div>
        ) : (
          collections.map(collection => (
            <div
              key={collection.id}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedCollectionId === collection.id ? 'active' : ''}`}
            >
              {/* Parte clickeable para seleccionar colección */}
              <div
                className="collection-item-content flex-grow-1"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectCollection(collection.id)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <i className="bi bi-images me-2"></i>
                    {collection.name}
                  </span>
                  <span className="badge bg-primary rounded-pill">
                    {mediaCount[collection.id] || 0}
                  </span>
                </div>
                {collection.description && (
                  <small className="text-muted d-block mt-1">
                    {collection.description}
                  </small>
                )}
              </div>

              {/* Botones de acción (solo visibles al hacer hover) */}
              <div className="collection-actions ms-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary me-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCollection(collection);
                  }}
                  title="Editar colección"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(collection.id);
                  }}
                  title="Eliminar colección"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar colección */}
      <CollectionsModal
        isOpen={showModal}
        collection={editingCollection}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCollection}
      />
    </div>
  );
};