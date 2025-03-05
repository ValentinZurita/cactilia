import { useState, useEffect } from 'react';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection
} from '../../services/collectionsService';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../../store/messages/messageSlice';
import { CollectionsModal } from './CollectionsModal.jsx';

/**
 * Componente simplificado para gestionar colecciones de media
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.selectedCollectionId] - ID de la colección seleccionada
 * @param {Function} [props.onSelectCollection] - Callback al seleccionar una colección
 * @param {Array} [props.collections] - Colecciones ya filtradas (opcional)
 * @param {boolean} [props.hideSearch] - Si es true, oculta la barra de búsqueda interna
 * @param {boolean} [props.hideTitle] - Si es true, oculta el título del componente
 * @returns {JSX.Element}
 */
export const CollectionsManager = ({
                                     selectedCollectionId,
                                     onSelectCollection,
                                     collections: externalCollections,
                                     hideSearch = false,
                                     hideTitle = false
                                   }) => {
  // Estados principales
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // Usar colecciones externas o cargar las propias
  useEffect(() => {
    if (externalCollections) {
      setCollections(externalCollections);
    } else {
      loadCollections();
    }
  }, [externalCollections]);

  /**
   * Carga todas las colecciones disponibles
   */
  const loadCollections = async () => {
    try {
      setLoading(true);
      const result = await getCollections();

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar colecciones');
      }

      setCollections(result.data);
    } catch (error) {
      console.error('Error cargando colecciones:', error);
      dispatch(addMessage({
        type: 'error',
        text: `Error cargando colecciones: ${error.message}`
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda una colección (crea o actualiza)
   */
  const handleSaveCollection = async (collectionId, collectionData) => {
    try {
      setLoading(true);

      const result = collectionId
        ? await updateCollection(collectionId, collectionData)
        : await createCollection(collectionData);

      if (!result.ok) {
        throw new Error(result.error || 'Error al guardar colección');
      }

      dispatch(addMessage({
        type: 'success',
        text: collectionId ? 'Colección actualizada' : 'Colección creada'
      }));

      if (!externalCollections) {
        await loadCollections();
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error guardando colección:', error);
      dispatch(addMessage({
        type: 'error',
        text: `Error: ${error.message}`
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una colección después de confirmar
   */
  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('¿Eliminar esta colección? Las imágenes no se eliminarán.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteCollection(collectionId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar colección');
      }

      // Si la colección eliminada era la seleccionada, resetearla
      if (selectedCollectionId === collectionId && onSelectCollection) {
        onSelectCollection(null);
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Colección eliminada'
      }));

      if (!externalCollections) {
        await loadCollections();
      }
    } catch (error) {
      console.error('Error eliminando colección:', error);
      dispatch(addMessage({
        type: 'error',
        text: `Error: ${error.message}`
      }));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar colecciones según término de búsqueda (solo si no usamos colecciones externas ya filtradas)
  const filteredCollections = !externalCollections && searchTerm
    ? collections.filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : collections;

  return (
    <div className="collections-manager mb-4">
      {/* Campo de búsqueda (solo si no está oculto) */}
      {!hideSearch && (
        <div className="input-group input-group-sm rounded-3 mb-3 border shadow-sm">
          <span className="input-group-text bg-white border-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control form-control-sm border-0 shadow-none"
            placeholder="Filtrar colecciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-sm btn-link text-muted border-0"
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      )}

      {/* Lista de colecciones */}
      <div className="list-group collections-list">
        {/* Opción "Todas" */}
        <button
          type="button"
          className={`list-group-item list-group-item-action d-flex align-items-center py-2 px-3 ${!selectedCollectionId ? 'active' : ''}`}
          onClick={() => onSelectCollection && onSelectCollection(null)}
        >
          <i className="bi bi-images me-2"></i>
          <span className="d-inline-block collection-text text-truncate">
            Todas las imágenes
          </span>
        </button>

        {/* Listado de colecciones */}
        {loading && collections.length === 0 ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span className="ms-2">Cargando...</span>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <i className="bi bi-info-circle me-2"></i>
            No hay colecciones.
          </div>
        ) : (
          filteredCollections.map(collection => (
            <div
              key={collection.id}
              className={`list-group-item collection-item d-flex align-items-center py-2 px-3 ${selectedCollectionId === collection.id ? 'active' : ''}`}
            >
              {/* Área seleccionable */}
              <div
                className="d-flex align-items-center flex-grow-1"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectCollection && onSelectCollection(collection.id)}
              >
                <span
                  className="color-dot me-2 rounded-circle d-inline-block"
                  style={{
                    backgroundColor: collection.color || '#3b82f6',
                    width: '8px',
                    height: '8px'
                  }}
                ></span>
                <span className="d-inline-block collection-text text-truncate">
                  {collection.name}
                </span>
              </div>

              {/* Acciones simplificadas */}
              <div className="collection-actions">
                <button
                  type="button"
                  className="action-btn edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCollection(collection);
                    setShowModal(true);
                  }}
                  title="Editar"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  type="button"
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(collection.id);
                  }}
                  title="Eliminar"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Botón para añadir colección */}
        <button
          type="button"
          className="list-group-item list-group-item-action d-flex justify-content-center align-items-center py-2 add-collection-btn"
          onClick={() => {
            setEditingCollection(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          <span>Añadir colección</span>
        </button>
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