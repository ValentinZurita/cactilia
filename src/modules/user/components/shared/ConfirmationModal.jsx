import React, { useEffect, useCallback } from 'react';
import '../../styles/confimationModal.css';

/**
 * Modal de confirmación reutilizable para diferentes acciones (eliminar, desactivar, etc.)
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar la acción
 * @param {string} props.title - Título del modal
 * @param {string|JSX.Element} props.message - Mensaje principal
 * @param {string|JSX.Element} props.detail - Detalle o información adicional (opcional)
 * @param {string} props.confirmText - Texto del botón de confirmación
 * @param {string} props.cancelText - Texto del botón de cancelación
 * @param {string} props.icon - Clase del icono (por ejemplo, "bi-trash" para icono de papelera)
 * @param {string} props.iconColor - Color del icono (por ejemplo, "danger", "warning")
 * @param {string} props.confirmColor - Color del botón de confirmación (por ejemplo, "danger", "success")
 * @param {boolean} props.loading - Estado de carga durante la acción
 * @param {JSX.Element} props.children - Contenido adicional opcional para el modal
 * @returns {JSX.Element|null} - Componente de modal o null si está cerrado
 */
export const ConfirmationModal = React.memo(({
                                               isOpen,
                                               onClose,
                                               onConfirm,
                                               title = "Confirmar acción",
                                               message,
                                               detail,
                                               confirmText = "Confirmar",
                                               cancelText = "Cancelar",
                                               icon = "bi-exclamation-circle",
                                               iconColor = "warning",
                                               confirmColor = "primary",
                                               loading = false,
                                               children
                                             }) => {
  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    // Solo modificar si está abierto
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Manejar tecla ESC para cerrar el modal (memoizado)
  useEffect(() => {
    // Solo agregar listener si está abierto
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, onClose]);

  // Prevenir que clics en el contenido del modal cierren el modal (memoizado)
  const handleModalContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Mapeo de colores para iconos y botones
  const colorMap = {
    primary: { icon: 'text-primary', button: 'btn-primary' },
    secondary: { icon: 'text-secondary', button: 'btn-secondary' },
    success: { icon: 'text-success', button: 'btn-success' },
    danger: { icon: 'text-danger', button: 'btn-danger' },
    warning: { icon: 'text-warning', button: 'btn-warning' },
    info: { icon: 'text-info', button: 'btn-info' },
    light: { icon: 'text-light', button: 'btn-light' },
    dark: { icon: 'text-dark', button: 'btn-dark' },
  };

  // Obtener clases CSS según los colores seleccionados
  const iconColorClass = colorMap[iconColor]?.icon || 'text-warning';
  const confirmButtonClass = colorMap[confirmColor]?.button || 'btn-primary';

  // Manejadores de eventos memoizados
  const handleConfirmClick = useCallback(() => {
    if (onConfirm) onConfirm();
  }, [onConfirm]);

  const handleCancelClick = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  return (
    <div
      className="confirmation-modal-backdrop"
      onClick={handleCancelClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        className="confirmation-modal-content"
        onClick={handleModalContentClick}
      >
        <div className="confirmation-modal-header">
          <h5 className="confirmation-modal-title" id="confirmation-modal-title">
            {title}
          </h5>
          <button
            type="button"
            className="confirmation-modal-close"
            onClick={handleCancelClick}
            aria-label="Cerrar"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="confirmation-modal-body">
          <div className="confirmation-content">
            {/* Icono y mensaje principal */}
            <div className="d-flex mb-3">
              <div className="confirmation-icon-container me-3">
                <i className={`bi ${icon} ${iconColorClass} confirmation-icon`}></i>
              </div>
              <div className="confirmation-message">
                {message}
              </div>
            </div>

            {/* Detalle adicional */}
            {detail && (
              <div className="confirmation-detail">
                {detail}
              </div>
            )}

            {/* Contenido personalizado opcional */}
            {children}
          </div>

          {/* Botones de acción */}
          <div className="confirmation-actions">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancelClick}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${confirmButtonClass}`}
              onClick={handleConfirmClick}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Procesando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Añadir displayName para DevTools
ConfirmationModal.displayName = 'ConfirmationModal';