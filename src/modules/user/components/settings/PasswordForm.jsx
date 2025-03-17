/**
 * Componente para el formulario de cambio de contraseña
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.passwordData - Datos del formulario de contraseña
 * @param {Object} props.passwordMessage - Mensaje de éxito/error
 * @param {boolean} props.passwordLoading - Estado de carga del formulario
 * @param {Function} props.handlePasswordChange - Manejador de cambios en el formulario
 * @param {Function} props.handlePasswordSubmit - Manejador de envío del formulario
 * @returns {JSX.Element}
 */
export const PasswordForm = ({
                               passwordData,
                               passwordMessage,
                               passwordLoading,
                               handlePasswordChange,
                               handlePasswordSubmit
                             }) => {
  return (
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
        <label className="settings-label" htmlFor="currentPassword">Contraseña actual</label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-lock"></i>
          </span>
          <input
            type="password"
            className="form-control"
            id="currentPassword"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            disabled={passwordLoading}
          />
        </div>
      </div>

      {/* Nueva contraseña */}
      <div className="settings-form-group">
        <label className="settings-label" htmlFor="newPassword">Nueva contraseña</label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-key"></i>
          </span>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
            disabled={passwordLoading}
          />
        </div>
        <div className="form-text">
          Mínimo 6 caracteres
        </div>
      </div>

      {/* Confirmar contraseña */}
      <div className="settings-form-group">
        <label className="settings-label" htmlFor="confirmPassword">Confirmar nueva contraseña</label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-check-lg"></i>
          </span>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
            disabled={passwordLoading}
          />
        </div>
        {passwordData.newPassword && passwordData.confirmPassword &&
          passwordData.newPassword !== passwordData.confirmPassword && (
            <div className="form-text text-danger">
              Las contraseñas no coinciden
            </div>
          )}
      </div>

      {/* Botón actualizar */}
      <button
        type="submit"
        className="btn btn-green-3 text-white"
        disabled={passwordLoading || (passwordData.newPassword !== passwordData.confirmPassword)}
      >
        {passwordLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Actualizando...
          </>
        ) : (
          'Actualizar Contraseña'
        )}
      </button>
    </form>
  );
};