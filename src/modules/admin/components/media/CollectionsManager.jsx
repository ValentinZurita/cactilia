import { useState, useEffect } from 'react';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getMediaByCollection
} from '../../services/collectionsService';
import { addMessage } from '../../../../store/messages/messageSlice';
import { useDispatch } from 'react-redux';
import { CollectionsModal } from './CollectionsModal.jsx'

/**
 * Componente para gestionar colecciones de media
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
  // Estado para colecciones y UI
  const [collections, setCollections] = useState([]);
  const [editingCollection, setEditingCollection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaCount, setMediaCount] = useState({});
  const [searchTerm, setSearchTerm] = useState(''); // Nuevo: búsqueda de colecciones

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
      setShowModal(false);

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

  // Filtrar colecciones según término de búsqueda
  const filteredCollections = searchTerm
    ? collections.filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : collections;

  // Calcular el total de imágenes
  const totalImages = Object.values(mediaCount).reduce((sum, count) => sum + count, 0);

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

      {/* Campo de búsqueda para colecciones */}
      <div className="mb-3">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white border">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Buscar colecciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary border"
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="alert alert-danger alert-sm py-2" role="alert">
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
          onClick={() => onSelectCollection && onSelectCollection(null)}
        >
          <span className="d-flex align-items-center">
            <i className="bi bi-collection me-2"></i>
            <span className="d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
              Todas las imágenes
            </span>
          </span>
          <span className="badge bg-primary rounded-pill">
            {totalImages || 0}
          </span>
        </button>

        {/* Lista de colecciones cargadas */}
        {loading && collections.length === 0 ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <span className="ms-2">Cargando colecciones...</span>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-3 text-muted">
            {searchTerm ? (
              <>
                <i className="bi bi-search me-2"></i>
                No se encontraron colecciones con "{searchTerm}".
              </>
            ) : (
              <>
                <i className="bi bi-info-circle me-2"></i>
                No hay colecciones. Crea una para organizar tus imágenes.
              </>
            )}
          </div>
        ) : (
          filteredCollections.map(collection => (
            <div
              key={collection.id}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedCollectionId === collection.id ? 'active' : ''}`}
            >
              {/* Parte clickeable para seleccionar colección */}
              <div
                className="collection-item-content flex-grow-1 d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectCollection && onSelectCollection(collection.id)}
              >
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-images me-2"></i>
                    <span className="d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
                      {collection.name}
                    </span>
                  </div>
                  {collection.description && (
                    <small className="text-muted d-block mt-1 text-truncate" style={{ maxWidth: '180px' }}>
                      {collection.description}
                    </small>
                  )}
                </div>
                <span className="badge bg-primary rounded-pill ms-2">
                  {mediaCount[collection.id] || 0}
                </span>
              </div>

              {/* Botones de acción (siempre visibles en móvil, visible al hover en desktop) */}
              <div className="collection-actions ms-2 d-flex">
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-outline-secondary me-1"
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
                  className="btn btn-sm btn-icon btn-outline-danger"
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