import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/mediaLibrary.css';
import { CollectionsManager, MediaDetailsModal, MediaFilters, MediaGrid } from '../components/media/index.js'
import { useMediaLibrary } from '../hooks/useMediaLibrary.js'

/**
 * MediaLibraryPage - Página principal para la biblioteca multimedia
 *
 * Proporciona una interfaz para explorar, filtrar y gestionar archivos multimedia
 * con un diseño limpio y minimalista
 *
 * @returns {JSX.Element}
 */
export const MediaLibraryPage = () => {
  // Hook de navegación
  const navigate = useNavigate();

  // Estado para controlar visibilidad de detalles
  const [showDetails, setShowDetails] = useState(false);

  // Estado para visibilidad del gestor de colecciones en móvil
  const [showCollections, setShowCollections] = useState(false);

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

  // Manejador para seleccionar colección
  const handleSelectCollection = (collectionId) => {
    setFilters({ collectionId });

    // En móvil, ocultar el gestor de colecciones después de seleccionar
    if (window.innerWidth < 768) {
      setShowCollections(false);
    }
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

  return (
    <div className="media-library-container">
      {/* Encabezado con título y botón de carga */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Biblioteca Multimedia</h2>

        <div className="d-flex gap-2">
          {/* Botón para mostrar/ocultar colecciones en móvil */}
          <button
            className="btn btn-outline-primary d-md-none"
            onClick={() => setShowCollections(!showCollections)}
          >
            <i className={`bi bi-${showCollections ? 'x-lg' : 'collection'} me-2`}></i>
            {showCollections ? 'Cerrar colecciones' : 'Colecciones'}
          </button>

          {/* Botón de carga */}
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/media/upload')}
          >
            <i className="bi bi-upload me-2"></i>
            Subir Archivo
          </button>
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
        {/* Gestor de Colecciones - Columna lateral en desktop, expansible en móvil */}
        <div className={`col-md-3 mb-4 ${showCollections ? 'd-block' : 'd-none d-md-block'}`}>
          <CollectionsManager
            selectedCollectionId={filters.collectionId}
            onSelectCollection={handleSelectCollection}
          />
        </div>

        {/* Contenido principal - Grid y filtros */}
        <div className="col-md-9">
          {/* Componente de filtros */}
          <MediaFilters
            filters={filters}
            onFilterChange={setFilters}
          />

          {/* Grid de elementos multimedia */}
          <MediaGrid
            items={mediaItems}
            loading={loading}
            onSelectItem={handleSelectItem}
            onDeleteItem={handleDelete}
          />
        </div>
      </div>

      {/* Modal de detalles (se muestra cuando se selecciona un elemento) */}
      <MediaDetailsModal
        media={selectedItem}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onUpdate={handleUpdate}
      />
    </div>
  );
};