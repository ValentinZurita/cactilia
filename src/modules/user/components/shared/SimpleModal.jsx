import React, { useEffect } from 'react';

/**
 * Un componente de modal simple sin usar ReactDOM.createPortal
 */
export const SimpleModal = ({
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

  // Determinar la clase de tamaño
  const sizeClasses = {
    sm: 'w-75 w-sm-50 w-md-25',
    md: 'w-100 w-sm-75 w-md-50',
    lg: 'w-100 w-sm-100 w-md-75',
    xl: 'w-100'
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded shadow-lg ${sizeClasses[size] || sizeClasses.md}`}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
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
        <div className="p-3" style={{ overflowY: 'auto' }}>
          {children}
        </div>

        {/* Pie */}
        {footer && (
          <div className="p-3 border-top d-flex justify-content-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};