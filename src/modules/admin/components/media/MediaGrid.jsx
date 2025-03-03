import { MediaItem } from './MediaItem';

/**
 * MediaGrid - Componente para mostrar una colección de elementos multimedia en formato de cuadrícula
 *
 * Renderiza una cuadrícula responsive de elementos multimedia con soporte para estados de carga
 * y mensajes para estado vacío, así como selección múltiple
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Elementos multimedia a mostrar
 * @param {Function} props.onSelectItem - Manejador para selección de elemento
 * @param {Function} [props.onDeleteItem] - Manejador para eliminación de elemento (opcional)
 * @param {boolean} [props.loading] - Indicador de estado de carga
 * @param {Array} [props.selectedItems] - IDs de elementos seleccionados para modo multiselección
 * @returns {JSX.Element}
 */
export const MediaGrid = ({
                            items = [],
                            onSelectItem,
                            onDeleteItem,
                            loading = false,
                            selectedItems = []
                          }) => {
  // Mostrar skeleton de carga cuando se están cargando elementos
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

  // Mostrar mensaje de estado vacío cuando no hay elementos
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-images"></i>
        <h5>No se encontraron archivos multimedia</h5>
        <p className="text-muted">
          Sube nuevos archivos o ajusta tus filtros para ver más resultados.
        </p>
      </div>
    );
  }

  // Renderizar la cuadrícula de elementos multimedia
  return (
    <div className="row g-3">
      {items.map((item) => (
        <div key={item.id} className="col-6 col-md-4 col-lg-3">
          <MediaItem
            item={item}
            onSelect={onSelectItem}
            onDelete={onDeleteItem}
            isSelected={selectedItems.includes(item.id)}
          />
        </div>
      ))}
    </div>
  );
};