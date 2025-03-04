import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal para crear o editar una colección de imágenes
 * Con interfaz mejorada para móviles y mejor experiencia de usuario
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla si el modal está abierto
 * @param {Object} props.collection - Colección a editar (null para crear nueva)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar la colección
 * @returns {JSX.Element|null}
 */
export const CollectionsModal = ({ isOpen, collection, onClose, onSave }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6' // Color por defecto: azul
  });

  // Referencia al input de nombre para autofoco
  const nameInputRef = useRef(null);

  // Estado para la animación del modal
  const [isVisible, setIsVisible] = useState(false);

  // Estado para validación y errores
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar datos cuando cambia la colección seleccionada
  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || '',
        description: collection.description || '',
        color: collection.color || '#3b82f6'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6'
      });
    }

    // Resetear errores
    setErrors({});
    setIsSubmitting(false);
  }, [collection]);

  // Efecto para manejar la animación del modal y el autofoco
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Animar entrada
      setTimeout(() => {
        setIsVisible(true);

        // Auto-focus en el nombre
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 50);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // No renderizar si el modal está cerrado
  if (!isOpen) return null;

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación en tiempo real
    if (name === 'name' && !value.trim()) {
      setErrors(prev => ({
        ...prev,
        name: 'El nombre es obligatorio'
      }));
    } else if (name === 'name' && value.trim()) {
      setErrors(prev => ({
        ...prev,
        name: null
      }));
    }
  };

  // Validar el formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre (requerido)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la colección es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Guardar colección
      await onSave(collection?.id, formData);

      // Cerrar modal con animación
      handleClose();
    } catch (error) {
      console.error('Error al guardar colección:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar el modal con animación
  const handleClose = () => {
    if (isSubmitting) return; // No cerrar si está enviando

    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Prevenir que los clics en el contenido cierren el modal
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Colores predefinidos para colecciones
  const predefinedColors = [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#ef4444', // Rojo
    '#f59e0b', // Ámbar
    '#8b5cf6', // Violeta
    '#ec4899', // Rosa
    '#6b7280'  // Gris
  ];

  return ReactDOM.createPortal(
    <div
      className={`modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        padding: '1rem'
      }}
    >
      <div
        className="modal-content collection-modal"
        onClick={stopPropagation}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '480px',
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Cabecera del modal */}
        <div className="modal-header border-bottom p-3 d-flex align-items-center">
          <h5 className="modal-title m-0 d-flex align-items-center">
            <span
              className="color-swatch me-2 rounded-circle d-inline-block"
              style={{
                backgroundColor: formData.color,
                width: '16px',
                height: '16px',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            ></span>
            {collection ? 'Editar colección' : 'Nueva colección'}
          </h5>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={handleClose}
            aria-label="Close"
            disabled={isSubmitting}
          ></button>
        </div>

        {/* Cuerpo del modal con formulario */}
        <div className="modal-body p-4">
          <form onSubmit={handleSubmit} id="collection-form">
            {/* Campo nombre */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label small fw-medium">
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control form-control-sm ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej. Banners, Productos destacados..."
                ref={nameInputRef}
                disabled={isSubmitting}
                autoComplete="off"
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>

            {/* Campo descripción */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label small fw-medium">
                Descripción <span className="text-muted">(opcional)</span>
              </label>
              <textarea
                className="form-control form-control-sm"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el propósito de esta colección..."
                rows="2"
                disabled={isSubmitting}
              />
              <div className="form-text small">
                Ayuda a identificar para qué se usa esta colección
              </div>
            </div>

            {/* Selector de color */}
            <div className="mb-3">
              <label className="form-label small fw-medium d-block">
                Color <span className="text-muted">(opcional)</span>
              </label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="btn p-0 color-picker-btn"
                    style={{
                      backgroundColor: color,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: formData.color === color ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      boxShadow: formData.color === color ? '0 0 0 2px white' : 'none',
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    disabled={isSubmitting}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              <div className="d-flex align-items-center mt-2">
                <input
                  type="color"
                  className="form-control form-control-color me-2"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  title="Elegir color personalizado"
                  disabled={isSubmitting}
                  style={{ width: '36px', height: '36px' }}
                />
                <div className="form-text small">
                  El color ayuda a identificar visualmente la colección
                </div>
              </div>
            </div>

            {/* Vista previa de la colección */}
            <div className="collection-preview p-3 rounded-3 mb-3 bg-light">
              <div className="d-flex align-items-center">
                <span
                  className="color-dot me-2"
                  style={{
                    backgroundColor: formData.color,
                    width: '10px',
                    height: '10px'
                  }}
                ></span>
                <span className="fw-medium">{formData.name || 'Nombre de colección'}</span>
                {formData.description && (
                  <span className="text-muted ms-2 small">
                    - {formData.description}
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Pie del modal con botones */}
        <div className="modal-footer bg-light p-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-primary"
            form="collection-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {collection ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              collection ? 'Actualizar' : 'Crear'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};