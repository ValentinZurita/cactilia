/**
 * Componente para las preferencias de comunicación del usuario
 * Versión simplificada con solo suscripción por email
 *
 * @returns {JSX.Element}
 */
export const PrivacyPreferences = () => {
  return (
    <div className="privacy-options">
      {/* Opción de suscripción por email */}
      <div className="privacy-option d-flex justify-content-between align-items-center mb-3">
        {/* Texto */}
        <div>
          <h6 className="mb-1">Notificaciones por email</h6>
          <p className="text-muted small mb-0">Recibir emails sobre ofertas, novedades y productos destacados</p>
        </div>

        {/* Switch */}
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="emailNotifs" defaultChecked />
        </div>
      </div>

      {/* Nota sobre preferencias */}
      <div className="alert alert-light mt-3 d-flex align-items-center gap-2">
        <i className="bi bi-info-circle text-muted"></i>
        <small className="text-muted">
          Puedes cambiar tus preferencias de comunicación en cualquier momento.
          También puedes darte de baja directamente desde cualquier email que recibas.
        </small>
      </div>
    </div>
  );
};