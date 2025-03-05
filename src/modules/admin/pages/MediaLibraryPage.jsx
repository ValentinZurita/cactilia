import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/mediaLibrary.css';
import { CollectionsManager, MediaDetailsModal, MediaGrid } from '../components/media/index.js'
import { useMediaLibrary } from '../hooks/useMediaLibrary.js'
import { getCollections } from '../services/collectionsService';

/**
 * MediaLibraryPage - Versión minimalista con interfaz simplificada
 */
export const MediaLibraryPage = () => {
  // Hook de navegación
  const navigate = useNavigate();

  // Estado para colecciones
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);

  // Estados para UI
  const [showDetails, setShowDetails] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener datos y métodos del hook de biblioteca multimedia
  const {
    mediaItems,
    loading,
    error,
    filters,
    selectedItem,
    setSelectedItem,
    handleDelete,
    handleUpdate,
    setFilters
  } = useMediaLibrary();

  // Cargar colecciones al iniciar
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const result = await getCollections();
        if (result.ok) {
          setCollections(result.data);
          setFilteredCollections(result.data);
        }
      } catch (error) {
        console.error('Error cargando colecciones:', error);
      }
    };

    loadCollections();
  }, []);

  // Filtrar colecciones cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCollections(collections);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = collections.filter(collection =>
      collection.name.toLowerCase().includes(lowerSearchTerm) ||
      (collection.description && collection.description.toLowerCase().includes(lowerSearchTerm))
    );

    setFilteredCollections(filtered);
  }, [searchTerm, collections]);

  // Manejador para seleccionar colección
  const handleSelectCollection = (collectionId) => {
    setFilters({ collectionId });

    // En móvil, ocultar el gestor de colecciones después de seleccionar
    if (window.innerWidth < 768) {
      setShowCollections(false);
    }
  };

  // Manejador para la búsqueda unificada
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters({ searchTerm: value });
  };

  // Manejador para seleccionar un elemento para ver detalles
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  // Manejador para cerrar el modal de detalles
  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Obtener nombre de la colección seleccionada
  const getSelectedCollectionName = () => {
    if (!filters.collectionId) return null;

    const collection = collections.find(c => c.id === filters.collectionId);
    return collection ? collection.name : "Colección";
  };

  return (
    <div className="media-library-container position-relative">
      {/* Encabezado simple con título */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title">Biblioteca Multimedia</h2>

        {/* Botón para móvil para alternar colecciones */}
        <button
          className="btn btn-outline-primary d-md-none"
          onClick={() => setShowCollections(!showCollections)}
        >
          <i className={`bi bi-${showCollections ? 'x-lg' : 'collection'}`}></i>
        </button>
      </div>

      {/* Barra de búsqueda simplificada */}
      <div className="search-bar-container mb-4">
        <div className="input-group input-group-lg shadow-sm">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar archivos multimedia..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary border-start-0"
              onClick={() => {
                setSearchTerm('');
                setFilters({ searchTerm: '' });
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Mensaje de error si aplica */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="row">
        {/* Gestor de Colecciones - Sin título redundante */}
        <div className={`col-md-3 mb-4 ${showCollections ? 'd-block' : 'd-none d-md-block'}`}>
          <CollectionsManager
            selectedCollectionId={filters.collectionId}
            onSelectCollection={handleSelectCollection}
            collections={filteredCollections}
            hideSearch={true}
            hideTitle={true} // Nuevo prop para ocultar el título
          />
        </div>

        {/* Contenido principal - Grid */}
        <div className="col-md-9">
          {/* Muestra la colección actualmente seleccionada como un header */}
          {filters.collectionId && (
            <div className="selected-collection-header mb-3 p-2 bg-light rounded-3 d-flex align-items-center">
              <span className="badge bg-primary me-2">Colección</span>
              <span className="fw-bold collection-name">
                {getSelectedCollectionName()}
              </span>
              <button
                className="btn btn-sm btn-link ms-auto text-muted"
                onClick={() => setFilters({ collectionId: null })}
                title="Mostrar todas las imágenes"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          )}

          {/* Grid de elementos multimedia */}
          <MediaGrid
            items={mediaItems}
            loading={loading}
            onSelectItem={handleSelectItem}
            onDeleteItem={handleDelete}
          />

          {/* Mensaje cuando no hay resultados */}
          {!loading && mediaItems.length === 0 && (
            <div className="text-center py-5 bg-light rounded-3 mt-3">
              <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
              <h5>No se encontraron archivos</h5>
              <p className="text-muted">
                {searchTerm
                  ? `No hay resultados para "${searchTerm}".`
                  : "No hay archivos en esta selección."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para subir archivo */}
      <button
        className="btn btn-primary rounded-circle shadow upload-floating-btn"
        onClick={() => navigate('/admin/media/upload')}
        title="Subir archivo"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        <i className="bi bi-plus-lg"></i>
      </button>

      {/* Modal de detalles */}
      <MediaDetailsModal
        media={selectedItem}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onUpdate={handleUpdate}
      />
    </div>
  );
};