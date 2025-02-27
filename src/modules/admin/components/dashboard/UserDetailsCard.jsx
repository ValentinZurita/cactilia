import React from 'react';

// Componentes internos para mejorar la legibilidad
const BackButton = ({ onClick }) => (
  <button
    className="btn btn-light rounded-circle shadow-sm p-2"
    onClick={onClick}
    title="Volver a la lista"
  >
    <i className="bi bi-chevron-left fs-5"></i>
  </button>
);

const UserAvatar = ({ user }) => (
  <div className="avatar-container mb-4">
    <img
      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&size=200`}
      alt={user.displayName || 'Usuario'}
      className="rounded-circle shadow-sm"
      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
    />
  </div>
);

const UserRole = ({ role }) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superadmin": return "bg-black text-white";
      case "admin": return "bg-black text-white";
      case "user": return "bg-primary";
      default: return "bg-secondary";
    }
  };

  return (
    <span className={`badge rounded-pill px-3 py-2 ${getRoleBadgeColor(role)}`}>
      {role || 'usuario'}
    </span>
  );
};

const UserContact = ({ icon, text }) => (
  <p className="text-muted mb-3 d-flex align-items-center justify-content-center">
    <i className={`bi bi-${icon} me-2`}></i>
    <span className="text-truncate">{text}</span>
  </p>
);

const ActionButton = ({ onClick, icon, text, variant }) => (
  <button
    className={`btn btn-outline-${variant} rounded-3 px-3`}
    onClick={onClick}
    title={text}
  >
    <i className={`bi bi-${icon} me-2`}></i>
    {text}
  </button>
);

const DetailField = ({ label, value, isMonospace = false }) => (
  <div className="detail-item">
    <h6 className="text-muted mb-1 small fw-bold">{label}</h6>
    <p className={`mb-3 ${isMonospace ? "user-select-all text-break bg-light p-2 rounded-3 small" : ""}`}>
      {value}
    </p>
  </div>
);

const EmptyOrdersSection = () => (
  <div className="text-center py-4 text-muted">
    <div className="p-4 bg-light rounded-4">
      <i className="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
      <p>Este usuario no tiene pedidos registrados</p>
    </div>
  </div>
);

/**
 * Formatea fechas de diferentes tipos a un formato legible
 */
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

/**
 * Componente para mostrar los detalles de un usuario
 * Diseño refinado, elegante y minimalista, con estructura modular para mejor mantenimiento
 *
 * @param {Object} props.user - Datos del usuario
 * @param {Function} props.onBack - Función para volver a la lista
 * @param {Function} [props.onChangeRole] - Función opcional para cambiar el rol
 * @param {Function} [props.onDelete] - Función opcional para eliminar el usuario
 * @returns {JSX.Element}
 */
export const UserDetailsCard = ({ user, onBack, onChangeRole, onDelete }) => {
  // Validar que exista un usuario
  if (!user) {
    return (
      <div className="alert alert-warning shadow-sm border-0">
        No se encontraron datos del usuario
      </div>
    );
  }

  return (
    <div className="user-details-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <BackButton onClick={onBack} />
      </div>

      <div className="row g-4">
        {/* Columna izquierda - Información principal */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
            <div className="card-body text-center p-4">
              <UserAvatar user={user} />

              {/* Nombre y rol */}
              <h3 className="card-title fw-bold mb-3">{user.displayName || 'Sin nombre'}</h3>
              <div className="mb-3">
                <UserRole role={user.role} />
              </div>

              {/* Información de contacto */}
              <UserContact icon="envelope" text={user.email || 'No disponible'} />

              {user.phoneNumber && (
                <UserContact icon="telephone" text={user.phoneNumber} />
              )}

              {/* Fecha de registro */}
              {user.createdAt && (
                <UserContact
                  icon="calendar-check"
                  text={`Registrado: ${formatDate(user.createdAt)}`}
                />
              )}

              {/* Acciones - centradas y limpias */}
              <div className="d-flex justify-content-center gap-2 mt-2">
                {onChangeRole && (
                  <ActionButton
                    onClick={() => onChangeRole(user)}
                    icon="person-gear"
                    text="Rol"
                    variant="warning"
                  />
                )}

                {onDelete && (
                  <ActionButton
                    onClick={() => onDelete(user.id)}
                    icon="trash"
                    text="Eliminar"
                    variant="danger"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Información adicional */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100 rounded-4">
            <div className="card-body p-4">
              <h4 className="card-title border-bottom pb-3 mb-4 d-flex align-items-center">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Información detallada
              </h4>

              <div className="row g-4">

                {/* UID */}
                <div className="col-12">
                  <DetailField
                    label="ID DE USUARIO"
                    value={user.id || 'No disponible'}
                    isMonospace={true}
                  />
                </div>

                {/* Última actualización */}
                {user.updatedAt && (
                  <div className="col-12 col-md-6">
                    <DetailField
                      label="ÚLTIMA ACTUALIZACIÓN"
                      value={formatDate(user.updatedAt)}
                    />
                  </div>
                )}

                {/* Último acceso */}
                {user.lastLogin && (
                  <div className="col-12 col-md-6">
                    <DetailField
                      label="ÚLTIMO ACCESO"
                      value={formatDate(user.lastLogin)}
                    />
                  </div>
                )}

                {/* Dirección */}
                {user.address && (
                  <div className="col-12">
                    <DetailField
                      label="DIRECCIÓN"
                      value={user.address}
                    />
                  </div>
                )}

                {/* Pedidos */}
                <div className="col-12 mt-4">
                  <h5 className="border-bottom pb-2 mb-3 d-flex align-items-center">
                    <i className="bi bi-bag me-2 text-primary"></i>
                    Historial de pedidos
                  </h5>

                  <EmptyOrdersSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};