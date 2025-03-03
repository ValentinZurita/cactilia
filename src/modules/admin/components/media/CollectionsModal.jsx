import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal para crear o editar una colección de imágenes
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
    description: ''
  });

  // Estado para la animación del modal
  const [isVisible, setIsVisible] = useState(false);

  // Estado para validación y errores
  const [errors, setErrors] = useState({});

  // Inicializar datos cuando cambia la colección seleccionada
  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || '',
        description: collection.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }

    // Resetear errores
    setErrors({});
  }, [collection]);

  // Efecto para manejar la animación del modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        setIsVisible(true);
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

    // Limpiar error específico al editar el campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
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
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) return;

    // Guardar colección
    onSave(collection?.id, formData);

    // Cerrar modal con animación
    handleClose();
  };

  // Cerrar el modal con animación
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Prevenir que los clics en el contenido cierren el modal
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

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
        className="modal-content"
        onClick={stopPropagation}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '500px',
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Cabecera del modal */}
        <div className="modal-header border-bottom p-3">
          <h5 className="modal-title m-0">
            {collection ? 'Editar Colección' : 'Nueva Colección'}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Cuerpo del modal con formulario */}
        <div className="modal-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Campo nombre */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nombre de la colección <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej. Hero Principal, Productos Destacados..."
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>

            {/* Campo descripción */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el propósito de esta colección..."
                rows="3"
              />
              <div className="form-text">
                Una descripción ayuda a identificar para qué se usa esta colección
              </div>
            </div>
          </form>
        </div>

        {/* Pie del modal con botones */}
        <div className="modal-footer bg-light p-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            {collection ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};