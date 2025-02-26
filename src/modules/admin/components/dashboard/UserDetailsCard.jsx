import React from 'react';

/**
 * Componente para mostrar los detalles de un usuario
 * Muestra la información completa del usuario en un diseño atractivo y responsive
 *
 * @param {Object} props.user - Datos del usuario
 * @param {Function} props.onBack - Función para volver a la lista
 * @param {Function} [props.onChangeRole] - Función opcional para cambiar el rol (solo visible si está definida)
 * @param {Function} [props.onDelete] - Función opcional para eliminar el usuario (solo visible si está definida)
 * @returns {JSX.Element}
 */
export const UserDetailsCard = ({ user, onBack, onChangeRole, onDelete }) => {
  // Validar que exista un usuario
  if (!user) {
    return (
      <div className="alert alert-warning">
        No se encontraron datos del usuario
      </div>
    );
  }

  // Formatear fechas
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No disponible';

    try {
      // Si es un timestamp de Firestore
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Si es una fecha normal
      return new Date(timestamp).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Obtener color según el rol
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-danger";
      case "admin":
        return "bg-warning text-dark";
      case "user":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="user-details-container">
      {/* Botón para volver */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver a la lista
        </button>

        {/* Acciones adicionales (solo si hay permisos) */}
        {(onChangeRole || onDelete) && (
          <div className="d-flex gap-2">
            {onChangeRole && (
              <button
                className="btn btn-warning"
                onClick={() => onChangeRole(user)}
                title="Cambiar rol de usuario"
              >
                <i className="bi bi-person-gear me-2"></i>
                Cambiar Rol
              </button>
            )}

            {onDelete && (
              <button
                className="btn btn-danger"
                onClick={() => onDelete(user.id)}
                title="Eliminar usuario"
              >
                <i className="bi bi-trash me-2"></i>
                Eliminar Usuario
              </button>
            )}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Columna izquierda - Información principal */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              {/* Avatar */}
              <div className="avatar-container mb-4">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&size=200`}
                  alt={user.displayName || 'Usuario'}
                  className="rounded-circle img-thumbnail"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>

              {/* Nombre y rol */}
              <h3 className="card-title mb-1">{user.displayName || 'Sin nombre'}</h3>
              <div className="mb-3">
                <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                  {user.role || 'usuario'}
                </span>
              </div>

              {/* Email */}
              <p className="text-muted mb-3">
                <i className="bi bi-envelope me-2"></i>
                {user.email || 'No disponible'}
              </p>

              {/* Teléfono (si existe) */}
              {user.phoneNumber && (
                <p className="text-muted mb-3">
                  <i className="bi bi-telephone me-2"></i>
                  {user.phoneNumber}
                </p>
              )}

              {/* Fecha de registro */}
              {user.createdAt && (
                <p className="small text-muted mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Registrado: {formatDate(user.createdAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Información adicional */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h4 className="card-title border-bottom pb-3 mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Información detallada
              </h4>

              <div className="row g-4">
                {/* UID */}
                <div className="col-12">
                  <div className="detail-item">
                    <h6 className="text-muted mb-1">ID de Usuario</h6>
                    <p className="mb-3 user-select-all text-break bg-light p-2 rounded">
                      {user.id || 'No disponible'}
                    </p>
                  </div>
                </div>

                {/* Última actualización */}
                {user.updatedAt && (
                  <div className="col-12 col-md-6">
                    <div className="detail-item">
                      <h6 className="text-muted mb-1">Última actualización</h6>
                      <p className="mb-0">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Último acceso */}
                {user.lastLogin && (
                  <div className="col-12 col-md-6">
                    <div className="detail-item">
                      <h6 className="text-muted mb-1">Último acceso</h6>
                      <p className="mb-0">{formatDate(user.lastLogin)}</p>
                    </div>
                  </div>
                )}

                {/* Dirección (si existe) */}
                {user.address && (
                  <div className="col-12">
                    <div className="detail-item">
                      <h6 className="text-muted mb-1">Dirección</h6>
                      <p className="mb-0">{user.address}</p>
                    </div>
                  </div>
                )}

                {/* Pedidos (simulado) */}
                <div className="col-12 mt-4">
                  <h5 className="border-bottom pb-2 mb-3">
                    <i className="bi bi-bag me-2"></i>
                    Historial de pedidos
                  </h5>

                  {/* Mostrar mensaje si no hay pedidos */}
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p>Este usuario no tiene pedidos registrados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};