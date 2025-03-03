import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MediaGrid } from './MediaGrid';
import { MediaFilters } from './MediaFilters';
import { getMediaItems } from '../../services/mediaService';

/**
 * MediaSelector - Modal para seleccionar archivos multimedia de la biblioteca
 *
 * Proporciona una interfaz para elegir archivos existentes de la biblioteca
 * de medios para su uso en otras partes de la aplicación.
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indicador si el modal está abierto
 * @param {Function} props.onClose - Manejador para cerrar el modal
 * @param {Function} props.onSelect - Manejador para seleccionar un archivo
 * @returns {JSX.Element|null}
 */
export const MediaSelector = ({ isOpen, onClose, onSelect }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: null,
    searchTerm: '',
  });
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Animación para entrada/salida del modal
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

  // Cargar elementos multimedia y extraer categorías
  useEffect(() => {
    if (!isOpen) return;

    const loadMedia = async () => {
      setLoading(true);

      try {
        const { ok, data, error } = await getMediaItems(filters);

        if (!ok) {
          throw new Error(error || "No se pudieron cargar los archivos");
        }

        setMediaItems(data);

        // Extraer categorías únicas
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error cargando archivos para el selector:", err);
        alert('Error al cargar archivos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [isOpen, filters]);

  // Si el modal no está abierto, no renderizar
  if (!isOpen) return null;

  // Manejar cambios en los filtros
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
        }}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <h5 className="modal-title">Seleccionar archivo</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar"
          ></button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          {/* Filtros */}
          <MediaFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
          />

          {/* Cuadrícula de archivos */}
          <MediaGrid
            items={mediaItems}
            loading={loading}
            onSelectItem={(item) => {
              onSelect(item);
              onClose();
            }}
          />
        </div>

        {/* Pie del Modal */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};