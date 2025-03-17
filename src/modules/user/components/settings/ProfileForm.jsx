import { useRef } from 'react';

/**
 * Componente para el formulario de información personal
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.profileData - Datos del perfil del usuario
 * @param {Object} props.profileMessage - Mensaje de éxito/error
 * @param {string} props.photoURL - URL de la foto de perfil
 * @param {boolean} props.profileLoading - Estado de carga del formulario
 * @param {boolean} props.photoLoading - Estado de carga de la foto
 * @param {Object} props.selectedPhoto - Archivo de foto seleccionado
 * @param {Function} props.handleProfileChange - Manejador de cambios en el formulario
 * @param {Function} props.handleProfileSubmit - Manejador de envío del formulario
 * @param {Function} props.handlePhotoChange - Manejador de cambio de foto
 * @param {Function} props.handlePhotoUpload - Manejador de subida de foto
 * @returns {JSX.Element}
 */
export const ProfileForm = ({
                              profileData,
                              profileMessage,
                              photoURL,
                              profileLoading,
                              photoLoading,
                              selectedPhoto,
                              handleProfileChange,
                              handleProfileSubmit,
                              handlePhotoChange,
                              handlePhotoUpload
                            }) => {
  // Referencia al input de archivo para activarlo con el botón personalizado
  const fileInputRef = useRef(null);

  // Manejador para el botón de cambiar foto
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

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
          <button
            type="button"
            className="btn-change-photo"
            onClick={triggerFileInput}
            disabled={photoLoading}
          >
            {photoLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-camera"></i>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={photoLoading}
          />
        </div>
        <p className="mt-2 text-muted small">Haz clic para cambiar tu foto</p>
        <p className="text-muted small">
          <i className="bi bi-info-circle me-1"></i>
          Formatos: JPG, PNG, GIF (máx. 2MB)
        </p>

        {/* Botón para subir foto, solo visible cuando hay una seleccionada */}
        {selectedPhoto && (
          <>
            <div className="mb-2 small">
              <span className="badge bg-light text-dark">
                {selectedPhoto.name.length > 20
                  ? selectedPhoto.name.substring(0, 17) + '...'
                  : selectedPhoto.name
                }
              </span>
              <span className="ms-2 text-muted">
                {(selectedPhoto.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-success mt-1"
              onClick={handlePhotoUpload}
              disabled={photoLoading}
            >
              {photoLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Subiendo...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up me-1"></i>
                  Guardar foto
                </>
              )}
            </button>
          </>
        )}
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
            <label className="settings-label" htmlFor="displayName">Nombre</label>
            <input
              type="text"
              className="form-control"
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleProfileChange}
              required
              disabled={profileLoading}
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Email (deshabilitado) */}
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control bg-light"
              id="email"
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
            <label className="settings-label" htmlFor="phoneNumber">Teléfono</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-telephone"></i>
              </span>
              <input
                type="tel"
                className="form-control"
                id="phoneNumber"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleProfileChange}
                placeholder="(Opcional)"
                disabled={profileLoading}
              />
            </div>
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            className="btn btn-green-3 text-white"
            disabled={profileLoading}
          >
            {profileLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>

        </form>
      </div>
    </div>
  );
};