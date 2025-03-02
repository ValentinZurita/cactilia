/**
 * Componente para el formulario de información personal
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.profileData - Datos del perfil del usuario
 * @param {Object} props.profileMessage - Mensaje de éxito/error
 * @param {string} props.photoURL - URL de la foto de perfil
 * @param {Function} props.handleProfileChange - Manejador de cambios en el formulario
 * @param {Function} props.handleProfileSubmit - Manejador de envío del formulario
 * @returns {JSX.Element}
 */
export const ProfileForm = ({
                              profileData,
                              profileMessage,
                              photoURL,
                              handleProfileChange,
                              handleProfileSubmit
                            }) => {


  return (
    <div className="row">

      {/* Avatar del usuario */}
      <div className="col-lg-4 mb-4 mb-lg-0 text-center">
        <div className="settings-avatar-container">
          <img
            src={photoURL || 'https://via.placeholder.com/100'}
            alt="Usuario"
            className="rounded-circle user-avatar-lg"
          />
          <button className="btn-change-photo">
            <i className="bi bi-camera"></i>
          </button>
        </div>
        <p className="mt-2 text-muted small">Haz clic para cambiar tu foto</p>
      </div>

      {/* Formulario de perfil */}
      <div className="col-lg-8">
        <form onSubmit={handleProfileSubmit}>

          {/* Mensaje de éxito/error */}
          {profileMessage.text && (
            <div className={`alert ${profileMessage.type === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
              <i className={`bi ${profileMessage.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
              {profileMessage.text}
            </div>
          )}

          {/* Nombre */}
          <div className="settings-form-group">
            <label className="settings-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="displayName"
              value={profileData.displayName}
              onChange={handleProfileChange}
              required
            />
          </div>

          {/* Email (deshabilitado) */}
          <div className="settings-form-group">
            <label className="settings-label">Email</label>
            <input
              type="email"
              className="form-control bg-light"
              name="email"
              value={profileData.email}
              disabled
            />
            <div className="form-text">
              El email no se puede cambiar
            </div>
          </div>

          {/* Teléfono */}
          <div className="settings-form-group">
            <label className="settings-label">Teléfono</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-telephone"></i>
              </span>
              <input
                type="tel"
                className="form-control"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleProfileChange}
                placeholder="(Opcional)"
              />
            </div>
          </div>

          {/* Botón guardar */}
          <button type="submit" className="btn btn-green-3 text-white">
            Guardar Cambios
          </button>

        </form>
      </div>
    </div>
  );
};