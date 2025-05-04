import React from 'react';

// --- Componentes Auxiliares para UserDetailsCard ---

export const UserAvatar = ({ user }) => (
  <div className="avatar-container mb-4">
    <img
      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&size=200`}
      alt={user.displayName || 'Usuario'}
      className="rounded-circle shadow-sm"
      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
    />
  </div>
);

export const UserRole = ({ role }) => {
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "superadmin":
      case "admin": 
        // Fondo gris claro, texto oscuro, borde
        return "bg-light text-dark border"; 
      case "user": 
        // Fondo blanco, texto gris, borde
        return "bg-white text-secondary border"; 
      default: 
        // Estilo por defecto similar a user
        return "bg-white text-secondary border";
    }
  };

  return (
    // Ajustar padding y tamaño de fuente para algo más discreto
    <span className={`badge rounded-pill px-2 py-1 ${getRoleBadgeStyle(role)} small`}> 
      {/* Capitalizar rol para mejor lectura */}
      {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Usuario'}
    </span>
  );
};

export const UserContact = ({ icon, text, className = '' }) => (
  <p className={`text-muted mb-1 small ${className}`}>
    <i className={`bi bi-${icon} me-2`}></i>
    <span className="text-truncate">{text}</span>
  </p>
);

// Refinado: ID (monospace) ahora SIN fondo gris. Acepta icono opcional.
export const DetailField = ({ label, value, isMonospace = false, iconClass = null }) => (
  <div className="detail-item mb-3">
    <p className="text-secondary mb-0 small">{label}</p>
    <p className={`mb-0 ${isMonospace ? "user-select-all text-break font-monospace" : "user-select-all"}`}>
      {/* Renderizar icono si se proporciona */} 
      {iconClass && <i className={`${iconClass} me-2 text-secondary`}></i>} 
      {value}
    </p>
  </div>
); 