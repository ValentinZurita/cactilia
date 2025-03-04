import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MediaGrid } from './MediaGrid';
import { getMediaItems } from '../../services/mediaService';
import { CollectionsManager } from './CollectionsManager.jsx'

/**
 * MediaSelector - Componente modal para seleccionar archivos multimedia de la biblioteca
 *
 * Proporciona una interfaz para navegar y seleccionar archivos multimedia existentes
 * con filtrado por colecciones
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Manejador para cerrar el modal
 * @param {Function} props.onSelect - Manejador para selección de archivo
 * @param {string} [props.title] - Título personalizado para el modal
 * @param {boolean} [props.allowMultiple] - Permite selección múltiple
 * @returns {JSX.Element|null}
 */
export const MediaSelector = ({
                                isOpen,
                                onClose,
                                onSelect,
                                title = "Seleccionar Archivo",
                                allowMultiple = false
                              }) => {
  // Estado para elementos multimedia
  const [mediaItems, setMediaItems] = useState([]);
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

  // Cargar elementos multimedia al abrir el modal o cambiar filtros
  useEffect(() => {
    if (!isOpen) return;

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

    loadMedia();
  }, [isOpen, filters]);

  // Resetear selección al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems([]);
    }
  }, [isOpen]);

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
    setFilters(prev => ({ ...prev, collectionId }));

    // En móvil, ocultar colecciones después de seleccionar
    if (window.innerWidth < 768) {
      setShowCollections(false);
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
   * Verifica si un elemento está seleccionado
   * @param {string} itemId - ID del elemento a verificar
   * @returns {boolean} - true si está seleccionado
   */
  const isItemSelected = (itemId) => {
    return selectedItems.some(item => item.id === itemId);
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
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="modal-content media-selector-modal"
        onClick={e => e.stopPropagation()}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          width: '90%',
          maxWidth: '1200px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
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
            {/* Panel de colecciones */}
            <div className={`col-md-3 h-100 border-end ${showCollections ? 'd-block' : 'd-none d-md-block'}`}>
              <div className="p-3 h-100 overflow-auto">
                <CollectionsManager
                  selectedCollectionId={filters.collectionId}
                  onSelectCollection={handleSelectCollection}
                />
              </div>
            </div>

            {/* Panel principal */}
            <div className="col-md-9 h-100 d-flex flex-column">
              {/* Barra de búsqueda */}
              <div className="p-3 border-bottom">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar archivos..."
                    value={filters.searchTerm || ''}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              {/* Grid de elementos multimedia */}
              <div className="p-3 overflow-auto" style={{ flexGrow: 1 }}>
                <MediaGrid
                  items={mediaItems}
                  loading={loading}
                  onSelectItem={handleSelectItem}
                  selectedItems={allowMultiple ? selectedItems.map(item => item.id) : []}
                />

                {/* Mensaje si no hay elementos */}
                {!loading && mediaItems.length === 0 && (
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