/**
 * Componente para las preferencias de privacidad del usuario
 *
 * @returns {JSX.Element}
 */
export const PrivacyPreferences = () => {


  return (
    <div className="privacy-options">

      {/* Opción de privacidad */}
      <div className="privacy-option d-flex justify-content-between align-items-center mb-3">

        {/* Texto */}
        <div>
          <h6 className="mb-1">Notificaciones por email</h6>
          <p className="text-muted small mb-0">Recibir emails sobre ofertas y nuevos productos</p>
        </div>

        {/* Switch */}
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="emailNotifs" defaultChecked />
        </div>

      </div>

      {/* Opción de privacidad */}
      <div className="privacy-option d-flex justify-content-between align-items-center">

        {/* Texto */}
        <div>
          <h6 className="mb-1">Historial de compras</h6>
          <p className="text-muted small mb-0">Mantener historial de productos visitados</p>
        </div>

        {/* Switch */}
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="browsingHistory" defaultChecked />
        </div>

      </div>
    </div>
  );
};