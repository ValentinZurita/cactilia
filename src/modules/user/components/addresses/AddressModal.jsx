import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Un componente de modal simple mejorado
 * Ahora con soporte para diferentes tamaños y usando ReactPortal
 *
 * @param {boolean} isOpen - Indica si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {string} title - Título del modal
 * @param {React.ReactNode} children - Contenido del modal
 * @param {React.ReactNode} footer - Pie del modal con botones
 * @param {string} size - Tamaño del modal ('sm', 'md', 'lg')
 */
export const AddressModal = ({
                               isOpen,
                               onClose,
                               title,
                               children,
                               footer,
                               size = 'md'
                             }) => {
  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Cerrar el modal cuando se hace clic en el fondo
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Usar ReactPortal para renderizar el modal en document.body
  return ReactDOM.createPortal(
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 3000  // Aumentar el z-index para asegurar que esté por encima de todo
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded shadow-lg simple-modal ${size}`}
        style={{
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative' // Asegurar posicionamiento correcto
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="m-0">{title}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* Cuerpo */}
        <div className="p-3 modal-body">
          {children}
        </div>

        {/* Pie */}
        {footer && (
          <div className="p-3 border-top d-flex justify-content-end gap-2 modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body // ¡Importante! Renderizar en document.body
  );
};