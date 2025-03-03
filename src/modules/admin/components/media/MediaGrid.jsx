import { MediaItem } from './MediaItem';

/**
 * MediaGrid - Componente para mostrar los elementos multimedia en una cuadrícula
 *
 * Presenta una colección de archivos multimedia de manera organizada
 * con soporte para estados de carga y mensajes cuando no hay contenido.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Elementos multimedia a mostrar
 * @param {Function} props.onSelectItem - Manejador para la selección de elementos
 * @param {Function} props.onDeleteItem - Manejador para la eliminación de elementos
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element}
 */
export const MediaGrid = ({ items = [], onSelectItem, onDeleteItem, loading = false }) => {
  // Mostrar esqueleto de carga cuando está cargando
  if (loading) {
    return (
      <div className="row g-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="col-6 col-md-4 col-lg-3">
            <div className="media-item-card p-2 h-100">
              <div className="placeholder-glow mb-2" style={{ height: '150px' }}>
                <div
                  className="placeholder w-100 h-100"
                  style={{ borderRadius: '6px' }}
                />
              </div>
              <div className="p-2">
                <p className="placeholder-glow mb-1">
                  <span className="placeholder col-7"></span>
                </p>
                <p className="placeholder-glow mb-0">
                  <span className="placeholder col-4"></span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Mostrar mensaje cuando no hay elementos
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-images"></i>
        <h5>No se encontraron archivos</h5>
        <p className="text-muted">
          Sube nuevos archivos o ajusta los filtros para ver más resultados.
        </p>
      </div>
    );
  }

  // Renderizar la cuadrícula con los elementos
  return (
    <div className="row g-3">
      {items.map((item) => (
        <div key={item.id} className="col-6 col-md-4 col-lg-3">
          <MediaItem
            item={item}
            onSelect={onSelectItem}
            onDelete={onDeleteItem}
          />
        </div>
      ))}
    </div>
  );
};