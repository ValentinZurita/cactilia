/**
 * Componente de formulario con retroalimentación (mensajes de éxito/error)
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSubmit - Función para manejar el envío del formulario
 * @param {Object} props.message - Mensaje de retroalimentación {type: 'success'|'error', text: 'mensaje'}
 * @param {JSX.Element} props.children - Contenido del formulario
 * @param {string} props.submitText - Texto del botón de envío
 * @param {string} props.submitClassName - Clases adicionales para el botón
 * @param {boolean} props.loading - Indica si el formulario está procesando una solicitud
 * @param {string} props.className - Clases adicionales para el formulario
 * @returns {JSX.Element}
 */
export const FeedbackForm = ({
                               onSubmit,
                               message = { type: '', text: '' },
                               children,
                               submitText = 'Guardar',
                               submitClassName = 'btn-green-3 text-white',
                               loading = false,
                               className = ''
                             }) => {
  return (
    <form className={`feedback-form ${className}`} onSubmit={onSubmit}>
      {/* Mensaje de retroalimentación */}
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
          {message.text}
        </div>
      )}

      {/* Contenido del formulario */}
      <div className="feedback-form-content">
        {children}
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        className={`btn ${submitClassName}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Procesando...
          </>
        ) : (
          submitText
        )}
      </button>
    </form>
  );
};