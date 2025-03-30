import PropTypes from 'prop-types';
import '../../styles/stockErrorAlert.css'

/**
 * Componente para mostrar errores de stock de forma amigable para el usuario
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje de error
 * @param {Function} props.onClose - Función para cerrar la alerta
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element|null}
 */
export const StockErrorAlert = ({ message, onClose, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`stock-error-alert ${className}`}>
      <div className="alert alert-warning border-0 shadow-sm">
        <div className="d-flex align-items-center">
          <div className="alert-icon me-3">
            <i className="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
          </div>
          <div className="alert-content flex-grow-1">
            <h5 className="alert-heading mb-1">Revisa tu carrito</h5>
            <p className="mb-0">{message}</p>
          </div>
          {onClose && (
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          )}
        </div>

        <div className="alert-actions mt-3">
          <a href="/shop/cart" className="btn btn-sm btn-outline-dark me-2">
            <i className="bi bi-cart me-1"></i>
            Ir al carrito
          </a>
          <a href="/shop" className="btn btn-sm btn-outline-success">
            <i className="bi bi-shop me-1"></i>
            Seguir comprando
          </a>
        </div>
      </div>
    </div>
  );
};

StockErrorAlert.propTypes = {
  message: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string
};