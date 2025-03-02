import { EmptyState } from './EmptyState';

/**
 * Componente genérico para mostrar listas de elementos con manejo de estados vacíos
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Lista de elementos a mostrar
 * @param {Function|React.Component} props.itemComponent - Componente para renderizar cada elemento
 * @param {Object} props.itemProps - Propiedades adicionales para pasar a cada elemento
 * @param {Object} props.emptyState - Configuración para el estado vacío
 * @param {string} props.emptyState.icon - Icono para el estado vacío (sin el prefijo bi-)
 * @param {string} props.emptyState.title - Título para el estado vacío
 * @param {string} props.emptyState.message - Mensaje para el estado vacío
 * @param {string} props.emptyState.actionLink - Enlace opcional para la acción
 * @param {string} props.emptyState.actionText - Texto para el botón de acción
 * @param {string} props.className - Clases CSS adicionales para la lista
 * @param {boolean} props.loading - Indica si los datos están cargando
 * @returns {JSX.Element}
 */
export const GenericItemList = ({
                                  items = [],
                                  itemComponent: ItemComponent,
                                  itemProps = {},
                                  emptyState = {
                                    icon: "collection",
                                    title: "No hay elementos",
                                    message: "No hay elementos para mostrar"
                                  },
                                  className = "",
                                  loading = false
                                }) => {

  // Si los datos están cargando, mostramos un spinner de carga
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando elementos...</p>
      </div>
    );
  }

  // Si no hay elementos, mostramos el estado vacío con un mensaje y acción
  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        message={emptyState.message}
        actionLink={emptyState.actionLink}
        actionText={emptyState.actionText}
      />
    );
  }

  // Si hay elementos, mostramos la lista con los elementos renderizados
  return (
    <ul className={`generic-item-list ${className}`}>
      {items.map((item, index) => (
        <ItemComponent
          key={item.id || index}
          {...item}
          {...itemProps}
        />
      ))}
    </ul>
  );
};