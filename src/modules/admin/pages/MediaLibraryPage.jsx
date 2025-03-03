import { useState, useEffect } from 'react';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaGrid, MediaFilters, MediaDetailsModal } from '../components/media';
import '../styles/mediaLibrary.css';

/**
 * MediaLibraryPage - Página principal para la gestión de la biblioteca de medios
 *
 * Esta página permite visualizar, filtrar y administrar los archivos multimedia
 * del sistema con una interfaz minimalista y elegante.
 *
 * @returns {JSX.Element}
 */
export const MediaLibraryPage = () => {
  // Lista predefinida de categorías disponibles para filtrar
  const [categories, setCategories] = useState(['hero', 'product', 'background', 'banner', 'icon', 'other']);
  const [showDetails, setShowDetails] = useState(false);

  // Obtener datos y métodos del hook personalizado
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

  // Extraer categorías únicas de los elementos cargados
  useEffect(() => {
    if (mediaItems.length > 0) {
      const uniqueCategories = [...new Set(mediaItems
        .map(item => item.category)
        .filter(Boolean))];

      if (uniqueCategories.length > 0) {
        setCategories(uniqueCategories);
      }
    }
  }, [mediaItems]);

  // Manejador para seleccionar un elemento y mostrar detalles
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
      {/* Encabezado con título y botón de subida */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Biblioteca de Medios</h2>

        <a
          href="/admin/media/upload"
          className="btn btn-primary"
        >
          <i className="bi bi-upload me-2"></i>
          Subir Nuevo Archivo
        </a>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Componente de filtros */}
      <MediaFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
      />

      {/* Cuadrícula de elementos multimedia */}
      <MediaGrid
        items={mediaItems}
        loading={loading}
        onSelectItem={handleSelectItem}
        onDeleteItem={handleDelete}
      />

      {/* Modal de detalles del elemento */}
      <MediaDetailsModal
        media={selectedItem}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onUpdate={handleUpdate}
      />
    </div>
  );
};