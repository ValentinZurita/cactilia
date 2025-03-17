import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/confimationModal.css';

/**
 * Modal de confirmación implementado como componente de clase para
 * evitar completamente los problemas con hooks.
 */
class ConfirmationModalContent extends Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.body.style.overflow = 'auto';
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    if (e.key === 'Escape' && !this.props.loading) {
      this.props.onClose();
    }
  }

  handleContentClick = (e) => {
    e.stopPropagation();
  }

  render() {
    const {
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
    } = this.props;

    // Clases CSS simplificadas
    const iconColorClass = `text-${iconColor}`;
    const confirmButtonClass = `btn-${confirmColor}`;

    return (
      <div
        className="confirmation-modal-backdrop"
        onClick={onClose}
      >
        <div
          className="confirmation-modal-content"
          onClick={this.handleContentClick}
        >
          <div className="confirmation-modal-header">
            <h5 className="confirmation-modal-title">
              {title}
            </h5>
            <button
              type="button"
              className="confirmation-modal-close"
              onClick={onClose}
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
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn ${confirmButtonClass}`}
                onClick={onConfirm}
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
  }
}

/**
 * Componente wrapper para crear un Portal y usar el componente de clase
 */
export const ConfirmationModal = (props) => {
  if (!props.isOpen) return null;

  // Utilizamos un portal para renderizar el modal fuera de la jerarquía normal de componentes
  return ReactDOM.createPortal(
    <ConfirmationModalContent {...props} />,
    document.body
  );
};