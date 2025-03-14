import React, { useEffect } from 'react';

/**
 * Componente Modal reutilizable
 * Proporciona una estructura consistente para todos los modales de la aplicación
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {string} props.size - Tamaño del modal ('sm', 'md', 'lg')
 * @param {boolean} props.showFooter - Si se muestra el footer con botones
 * @param {React.ReactNode} props.footer - Contenido personalizado del footer
 * @param {string} props.className - Clases adicionales para el modal
 * @returns {React.ReactNode|null}
 */
const Modal = ({
                 isOpen,
                 onClose,
                 title,
                 children,
                 size = 'md',
                 showFooter = true,
                 footer = null,
                 className = ''
               }) => {
  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Impedir el scroll del body cuando el modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Manejar el cierre al hacer clic en el backdrop
  const handleBackdropClick = (e) => {
    // Solo cerrar si se hizo clic directamente en el backdrop y no en el contenido
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determinar las clases de tamaño
  const sizeClass = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl',
  }[size] || '';

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      <div
        className={`modal-dialog ${sizeClass} ${className}`}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          maxWidth: '100%',
          margin: '1.75rem',
          animation: 'slideUp 0.3s ease-in-out',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="modal-header" style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h5 className="modal-title">{title}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar"
          ></button>
        </div>

        {/* Cuerpo del modal */}
        <div className="modal-body" style={{
          padding: '1rem',
          overflowY: 'auto'
        }}>
          {children}
        </div>

        {/* Footer opcional del modal */}
        {showFooter && (
          <div className="modal-footer" style={{
            padding: '1rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}>
            {footer || (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-green-3 text-white">
                  Guardar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal };