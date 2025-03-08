import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MediaGrid } from './MediaGrid';
import { getMediaItems } from '../../services/mediaService';
import { CollectionsManager } from './CollectionsManager';
import { getCollections } from '../../services/collectionsService';

/**
 * MediaSelector - Componente modal para seleccionar archivos multimedia o colecciones
 * Versión actualizada con soporte para selección de colecciones
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Manejador para cerrar el modal
 * @param {Function} props.onSelect - Manejador para selección de archivo/colección
 * @param {string} [props.title] - Título personalizado para el modal
 * @param {boolean} [props.allowMultiple] - Permite selección múltiple
 * @param {boolean} [props.selectCollection] - Si es true, selecciona colecciones en vez de medios
 * @returns {JSX.Element|null}
 */
export const MediaSelector = ({
                                isOpen,
                                onClose,
                                onSelect,
                                title = "Seleccionar Archivo",
                                allowMultiple = false,
                                selectCollection = false
                              }) => {
  // Estado para elementos multimedia
  const [mediaItems, setMediaItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para filtros
  const [filters, setFilters] = useState({
    collectionId: null,
    searchTerm: '',
  });

  // Estado para la animación del modal
  const [isVisible, setIsVisible] = useState(false);

  // Estado para selección múltiple
  const [selectedItems, setSelectedItems] = useState([]);

  // Estado para mostrar/ocultar colecciones en móvil
  const [showCollections, setShowCollections] = useState(false);

  // Manejar animación del modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cargar elementos según el modo (colecciones o medios)
  useEffect(() => {
    if (!isOpen) return;

    if (selectCollection) {
      loadCollections();
    } else {
      loadMedia();
    }
  }, [isOpen, filters, selectCollection]);

  // Resetear selección al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems([]);
    }
  }, [isOpen]);

  // Cargar colecciones
  const loadCollections = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCollections();

      if (!result.ok) {
        throw new Error(result.error || "Error al cargar colecciones");
      }

      setCollections(result.data);
    } catch (err) {
      console.error("Error cargando colecciones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar medios
  const loadMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      const { ok, data, error } = await getMediaItems(filters);

      if (!ok) {
        throw new Error(error || "Error al cargar archivos multimedia");
      }

      setMediaItems(data);
    } catch (err) {
      console.error("Error cargando medios para selector:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // No renderizar si el modal está cerrado
  if (!isOpen) return null;

  /**
   * Maneja el cambio de filtros
   * @param {Object} newFilters - Nuevos valores de filtros
   */
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Maneja la selección de colección
   * @param {string} collectionId - ID de la colección seleccionada
   */
  const handleSelectCollection = (collectionId) => {
    if (selectCollection) {
      // Si estamos en modo selección de colección, devolver la colección seleccionada
      const selectedCollection = collections.find(c => c.id === collectionId);
      if (selectedCollection) {
        onSelect(selectedCollection);
        onClose();
      }
    } else {
      // En modo normal, filtrar por colección
      setFilters(prev => ({ ...prev, collectionId }));

      // En móvil, ocultar colecciones después de seleccionar
      if (window.innerWidth < 768) {
        setShowCollections(false);
      }
    }
  };

  /**
   * Maneja la selección de elemento
   * @param {Object} item - Elemento multimedia seleccionado
   */
  const handleSelectItem = (item) => {
    if (allowMultiple) {
      // Modo selección múltiple
      const isAlreadySelected = selectedItems.some(i => i.id === item.id);

      if (isAlreadySelected) {
        setSelectedItems(selectedItems.filter(i => i.id !== item.id));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    } else {
      // Modo selección única - seleccionar y cerrar
      onSelect(item);
      onClose();
    }
  };

  /**
   * Maneja la confirmación de selección múltiple
   */
  const handleConfirmSelection = () => {
    if (selectedItems.length > 0) {
      onSelect(selectedItems);
      onClose();
    } else {
      alert('Por favor selecciona al menos un archivo');
    }
  };

  /**
   * Maneja la búsqueda de texto
   * @param {Event} e - Evento de cambio
   */
  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  return ReactDOM.createPortal(
    <div
      className={`modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        className="modal-content media-selector-modal"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          width: '90%',
          maxWidth: '1200px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <div className="d-flex gap-2">
            {/* Botón para mostrar/ocultar colecciones en móvil */}
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-md-none"
              onClick={(e) => {
                e.stopPropagation();
                setShowCollections(!showCollections);
              }}
            >
              <i className={`bi bi-${showCollections ? 'x-lg' : 'collection'} me-2`}></i>
              {showCollections ? 'Cerrar' : 'Colecciones'}
            </button>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body p-0" style={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Mensaje de error si aplica */}
          {error && (
            <div className="alert alert-danger m-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <div className="row h-100 g-0">
            {/* Panel de colecciones - solo visible si no estamos en modo selección de colección */}
            {!selectCollection && (
              <div className={`col-md-3 h-100 border-end ${showCollections ? 'd-block' : 'd-none d-md-block'}`}>
                <div className="p-3 h-100 overflow-auto">
                  <CollectionsManager
                    selectedCollectionId={filters.collectionId}
                    onSelectCollection={handleSelectCollection}
                  />
                </div>
              </div>
            )}

            {/* Panel principal - Grid de medios o lista de colecciones según el modo */}
            <div className={`${selectCollection ? 'col-12' : 'col-md-9'} h-100 d-flex flex-column`}>
              {/* Barra de búsqueda */}
              <div className="p-3 border-bottom">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Buscar ${selectCollection ? 'colecciones' : 'archivos'}...`}
                    value={filters.searchTerm || ''}
                    onChange={handleSearch}
                  />
                </div>
              </div>

{/* Grid de elementos multimedia o lista de colecciones */}
<div className="p-3 overflow-auto" style={{ flexGrow: 1 }}>
  {selectCollection ? (
    /* Vista para seleccionar colecciones */
    <div className="row g-3">
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Cargando colecciones...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-collection fs-1 text-muted"></i>
          <p className="mt-3 text-muted">No hay colecciones disponibles</p>
        </div>
      ) : (
        /* Lista de colecciones para seleccionar */
        collections
          .filter(col =>
            !filters.searchTerm ||
            col.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
          )
          .map(collection => (
            <div key={collection.id} className="col-md-4 col-lg-3">
              <div
                className="card h-100 border cursor-pointer shadow-sm"
                onClick={() => handleSelectCollection(collection.id)}
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${collection.color || '#3b82f6'}`
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-collection me-2"></i>
                    {collection.name}
                  </h6>
                  {collection.description && (
                    <p className="card-text small text-muted">
                      {collection.description}
                    </p>
                  )}
                </div>
                <div className="card-footer bg-light">
                  <small className="text-muted">
                    <i className="bi bi-images me-1"></i>
                    {collection.itemCount || "Seleccionar"}
                  </small>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  ) : (
    /* Vista para seleccionar medios */
    <MediaGrid
      items={mediaItems}
      loading={loading}
      onSelectItem={handleSelectItem}
      selectedItems={allowMultiple ? selectedItems.map(item => item.id) : []}
    />
  )}

  {/* Mensaje si no hay resultados */}
  {!loading && mediaItems.length === 0 && !selectCollection && (
    <div className="text-center py-5">
      <i className="bi bi-images fs-1 text-muted"></i>
      <p className="mt-3 text-muted">No se encontraron archivos multimedia</p>
      <p className="text-muted">
        Intenta con otra búsqueda o {' '}
        <a href="/admin/media/upload" target="_blank" rel="noopener noreferrer">
          sube nuevos archivos
        </a>
      </p>
    </div>
  )}
</div>
</div>
</div>
</div>

{/* Pie del Modal */}
<div className="modal-footer">
  {/* Mostrar elementos seleccionados si está en modo múltiple */}
  {allowMultiple && (
    <div className="me-auto">
              <span className="badge bg-primary me-2">
                {selectedItems.length} seleccionados
              </span>
    </div>
  )}

  <button
    type="button"
    className="btn btn-outline-secondary"
    onClick={onClose}
  >
    Cancelar
  </button>

  {/* Botón de confirmación para selección múltiple */}
  {allowMultiple && (
    <button
      type="button"
      className="btn btn-primary"
      onClick={handleConfirmSelection}
      disabled={selectedItems.length === 0}
    >
      Confirmar selección
    </button>
  )}
</div>
</div>
</div>,
document.body
);
};