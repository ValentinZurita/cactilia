import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ProfileCard, SectionTitle } from '../components/shared/index.js';
import '../styles/profileSettings.css';

/**
 * SettingsPage - Página refinada para gestionar configuración del perfil
 * Con estilo consistente con el resto de páginas del perfil
 */
export const SettingsPage = () => {
  // Obtener datos del usuario desde Redux store
  const { displayName, email, photoURL } = useSelector((state) => state.auth);

  // Estados para los formularios
  const [profileData, setProfileData] = useState({
    displayName: displayName || '',
    email: email || '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para mensajes de éxito/error
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  /**
   * Manejar cambios en el formulario de perfil
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  /**
   * Manejar cambios en el formulario de contraseña
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  /**
   * Manejar envío del formulario de perfil
   */
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // En implementación real, aquí se actualizaría el perfil en Firebase
    setProfileMessage({
      type: 'success',
      text: 'Perfil actualizado correctamente'
    });

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setProfileMessage({ type: '', text: '' });
    }, 3000);
  };

  /**
   * Manejar envío del formulario de contraseña
   */
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Validación básica
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    // En implementación real, aquí se actualizaría la contraseña en Firebase
    setPasswordMessage({
      type: 'success',
      text: 'Contraseña actualizada correctamente'
    });

    // Limpiar formulario
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setPasswordMessage({ type: '', text: '' });
    }, 3000);
  };

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Configuración de Cuenta" />

      {/* Perfil de usuario */}
      <ProfileCard title="Información Personal">
        <div className="row">
          {/* Avatar del usuario */}
          <div className="col-lg-4 mb-4 mb-lg-0 text-center">
            <div className="settings-avatar-container">
              <img
                src={photoURL || 'https://via.placeholder.com/100'}
                alt={displayName || 'Usuario'}
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

              {/* Campos del formulario ... */}
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
      </ProfileCard>

      {/* Cambio de contraseña */}
      <ProfileCard title="Cambiar Contraseña">
        <form onSubmit={handlePasswordSubmit}>
          {/* Mensaje de éxito/error */}
          {passwordMessage.text && (
            <div className={`alert ${passwordMessage.type === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
              <i className={`bi ${passwordMessage.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
              {passwordMessage.text}
            </div>
          )}

          {/* Contraseña actual */}
          <div className="settings-form-group">
            <label className="settings-label">Contraseña actual</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="settings-form-group">
            <label className="settings-label">Nueva contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-key"></i>
              </span>
              <input
                type="password"
                className="form-control"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-text">
              Mínimo 6 caracteres
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="settings-form-group">
            <label className="settings-label">Confirmar nueva contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-check-lg"></i>
              </span>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Botón actualizar */}
          <button type="submit" className="btn btn-green-3 text-white">
            Actualizar Contraseña
          </button>
        </form>
      </ProfileCard>

      {/* Preferencias de privacidad */}
      <ProfileCard title="Preferencias">
        <div className="privacy-options">
          <div className="privacy-option d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-1">Notificaciones por email</h6>
              <p className="text-muted small mb-0">Recibir emails sobre ofertas y nuevos productos</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="emailNotifs" defaultChecked />
            </div>
          </div>

          <div className="privacy-option d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">Historial de compras</h6>
              <p className="text-muted small mb-0">Mantener historial de productos visitados</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="browsingHistory" defaultChecked />
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
};