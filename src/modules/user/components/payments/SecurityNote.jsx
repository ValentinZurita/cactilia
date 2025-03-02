/**
 * Componente que muestra una nota de seguridad para los métodos de pago
 *
 * @returns {JSX.Element}
 */
export const SecurityNote = () => {
  return (
    <div className="alert alert-light mt-3 d-flex align-items-center gap-2">
      <i className="bi bi-shield-lock text-muted"></i>
      <small className="text-muted">
        Tu información de pago se almacena de forma segura.
        Nunca compartiremos tus datos con terceros.
      </small>
    </div>
  );
};