import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal personalizado para cambiar el rol de un usuario
 * Esta versión no utiliza Bootstrap Modal para evitar conflictos
 *
 * @param {Object} props.user - Usuario al que se cambiará el rol
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @returns {JSX.Element}
 */
export const UserRoleModal = ({ user, onClose, onSave }) => {
  const [newRole, setNewRole] = useState(user?.role || 'user');
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para mostrar el modal con una pequeña animación
  useEffect(() => {
    // Añadir la clase overflow-hidden al body para evitar scroll
    document.body.style.overflow = 'hidden';

    // Animar la entrada del modal
    setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Limpieza al desmontar el componente
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Función para cerrar el modal con animación
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Tiempo para que termine la animación
  };

  // Manejar el guardado de cambios
  const handleSave = () => {
    if (user && newRole) {
      onSave(user.id, newRole);
      handleClose();
    }
  };

  // Prevenir que los clics dentro del modal se propaguen al backdrop
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Verificar que el usuario existe
  if (!user) return null;

  // Usar createPortal para renderizar el modal directamente en el body
  return ReactDOM.createPortal(
    <div
      className={`custom-modal-overlay ${isVisible ? 'visible' : ''}`}
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
        className="custom-modal-content"
        onClick={stopPropagation}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '550px',
          maxHeight: '90vh',
          overflow: 'auto',
          transform: isVisible ? 'translateY(0)' : 'translateY(-50px)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Cabecera */}
        <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
          <h5 className="m-0">
            <i className="bi bi-person-gear me-2"></i>
            Cambiar Rol de Usuario
          </h5>
          <button
            className="btn-close"
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Cuerpo */}
        <div className="p-4">
          <div className="mb-4 text-center">
            {/* Avatar y nombre del usuario */}
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&size=150`}
              alt={user.displayName || 'Usuario'}
              className="rounded-circle mb-3 border"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <h5 className="mb-1">{user.displayName || 'Sin nombre'}</h5>
            <p className="text-muted small">{user.email}</p>
          </div>

          {/* Selector de rol */}
          <div className="mb-4">
            <label className="form-label fw-bold mb-2">Seleccionar Nuevo Rol:</label>
            <select
              className="form-select form-select-lg mb-3"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="user">Usuario Regular</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Super Administrador</option>
            </select>

            {/* Información sobre los roles */}
            <div className="mt-4 bg-light p-3 rounded">
              <h6 className="mb-3 fw-bold">Niveles de acceso:</h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                  <span className="badge bg-success me-2">Usuario</span>
                  <span>Acceso a la tienda como cliente</span>
                </li>
                <li className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                  <span className="badge bg-warning text-dark me-2">Admin</span>
                  <span>Gestión de productos y categorías</span>
                </li>
                <li className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                  <span className="badge bg-danger me-2">Superadmin</span>
                  <span>Control total del sistema</span>
                </li>
              </ul>
            </div>

            {/* Advertencia */}
            <div className="alert alert-warning mt-4 d-flex">
              <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
              <div>
                Cambiar el rol modificará los permisos del usuario en todo el sistema.
              </div>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-3 bg-light border-top d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};