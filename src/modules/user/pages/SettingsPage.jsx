import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ProfileCard, SectionTitle } from '../components/shared/index.js'

/**
 * SettingsPage
 *
 * Allows user to update profile settings and password
 */
export const SettingsPage = () => {
  // Get user data from Redux store
  const { displayName, email, photoURL } = useSelector((state) => state.auth);

  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: displayName || '',
    email: email || '',
    phoneNumber: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  /**
   * Handle profile form changes
   * @param {Object} e - Event object
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  /**
   * Handle password form changes
   * @param {Object} e - Event object
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  /**
   * Handle profile form submission
   * @param {Object} e - Event object
   */
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Would update profile in Firebase in real implementation
    alert('Perfil actualizado (simulado)');
  };

  /**
   * Handle password form submission
   * @param {Object} e - Event object
   */
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Would update password in Firebase Auth in real implementation
    alert('Contraseña actualizada (simulado)');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div>
      {/* Section title */}
      <SectionTitle title="Configuración" />

      {/* Profile form */}
      <ProfileCard title="Información Personal">
        <div className="row">
          {/* User avatar */}
          <div className="col-md-4 text-center mb-4 mb-md-0">
            <img
              src={photoURL || 'https://via.placeholder.com/100'}
              alt={displayName}
              className="rounded-circle mb-3 user-avatar"
            />
            <div>
              <button className="btn btn-sm btn-outline-green">
                <i className="bi bi-camera me-2"></i>
                Cambiar foto
              </button>
            </div>
          </div>

          {/* Profile form */}
          <div className="col-md-8">
            <form onSubmit={handleProfileSubmit}>
              {/* Name field */}
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              {/* Email field (disabled) */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={profileData.email}
                  disabled
                />
                <div className="form-text">
                  El email no se puede cambiar.
                </div>
              </div>

              {/* Phone field */}
              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                  placeholder="(Opcional)"
                />
              </div>

              {/* Submit button */}
              <button type="submit" className="btn btn-green-3 text-white">
                Guardar cambios
              </button>
            </form>
          </div>
        </div>
      </ProfileCard>

      {/* Password form */}
      <ProfileCard title="Cambiar Contraseña">
        <form onSubmit={handlePasswordSubmit}>
          {/* Current password field */}
          <div className="mb-3">
            <label className="form-label">Contraseña actual</label>
            <input
              type="password"
              className="form-control"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          {/* New password field */}
          <div className="mb-3">
            <label className="form-label">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
            />
            <div className="form-text">
              Mínimo 6 caracteres
            </div>
          </div>

          {/* Confirm password field */}
          <div className="mb-3">
            <label className="form-label">Confirmar nueva contraseña</label>
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

          {/* Submit button */}
          <button type="submit" className="btn btn-green-3 text-white">
            Actualizar contraseña
          </button>
        </form>
      </ProfileCard>
    </div>
  );
};