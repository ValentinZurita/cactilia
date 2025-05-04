import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal personalizado para cambiar el rol de un usuario
 * Versión refinada con diseño elegante y minimalista, alineado con Bootstrap 5
 *
 * @param {Object} props.user - Usuario al que se cambiará el rol
 * @param {string} props.currentUserRole - Rol del usuario actual (para lógica condicional si es necesaria)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @returns {JSX.Element}
 */
export const UserRoleModal = ({ user, currentUserRole, onClose, onSave }) => {
  const [newRole, setNewRole] = useState(user?.role || 'user');
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para animación y overflow (sin cambios)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, []);

  // Función para cerrar (sin cambios)
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Manejar guardado (sin cambios)
  const handleSave = () => {
    if (user && newRole) {
      onSave(user.id, newRole);
      handleClose();
    }
  };

  // stopPropagation (sin cambios)
  const stopPropagation = (e) => e.stopPropagation();

  // Obtener color según el rol
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-black text-white";
      case "admin":
        return "bg-black text-white";
      case "user":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  // Verificar que el usuario existe
  if (!user) return null;

  // DEBUG: Inspeccionar el objeto user recibido
  console.log("User object received by modal:", user);

  return ReactDOM.createPortal(
    // Usar un fragmento para renderizar backdrop y modal como hermanos
    <>
      {/* 1. Backdrop de Bootstrap */}
      <div className={`modal-backdrop fade ${isVisible ? 'show' : ''}`}></div>

      {/* 2. Contenedor del Modal */}
      <div
        className={`modal fade ${isVisible ? 'show' : ''}`}
        style={{ display: 'block' }} // Necesario para que sea visible sin JS de BS
        tabIndex="-1"
        role="dialog"
        aria-modal="true" // Mejor accesibilidad
        onClick={handleClose} // Cerrar al hacer clic fuera
      >
        {/* 3. Diálogo Centrado */}
        <div className="modal-dialog modal-dialog-centered" role="document" onClick={stopPropagation}>
          {/* 4. Contenido del Modal (sin estilos de fondo/opacidad inline) */}
          <div className="modal-content shadow-sm">
            
            {/* Cabecera del Modal (Texto más discreto) */} 
            <div className="modal-header border-bottom-0 pb-0">
              {/* Usar fs-6 para título más pequeño */} 
              <h6 className="modal-title d-flex align-items-center gap-2"> 
                <i className="bi bi-person-gear text-secondary"></i>
                <span>
                  Gestionar Rol
                  <small className="text-muted d-block fw-normal">{user.email}</small>
                </span>
              </h6>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Cuerpo del Modal */} 
            <div className="modal-body pt-2 pb-4">
              {/* Info usuario */} 
              <div className="text-center mb-4">
                 <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&size=80&background=random`}
                    alt={user.displayName || 'Avatar'}
                    className="rounded-circle mb-2 border border-light"
                    style={{ width: '80px', height: '80px' }} 
                 />
                 <h6 className="mb-0 fw-bold">{user.displayName || 'Usuario sin nombre'}</h6>
                 <span className={`badge ${getRoleBadgeColor(user.role)} rounded-pill px-2 py-1 small`}>Rol actual: {user.role || 'user'}</span>
              </div>
              
              {/* Selector de Rol */} 
              <div className="mb-3">
                <label htmlFor="role-select-modal" className="form-label small fw-bold mb-1">Nuevo Rol Asignado</label>
                <select
                  id="role-select-modal"
                  className="form-select form-select-sm"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {/* Advertencia simplificada y neutral */}
              <div className="alert alert-light border small p-2 d-flex align-items-center">
                  <i className="bi bi-info-circle me-2"></i>
                  <span>El cambio de rol afecta los permisos del usuario.</span>
              </div>
            </div>

            {/* Pie del Modal */} 
            <div className="modal-footer border-top-0 bg-light">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-sm btn-dark"
                onClick={handleSave}
                disabled={newRole === user.role}
              >
                Guardar Rol
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};