/**
 * StatusAlert: Muestra una alerta si alertState.show == true
 * De lo contrario, no renderiza nada.
 */
export const StatusAlert = ({ alertState }) => {
  if (!alertState.show) return null; // no hay alerta que mostrar

  return (
    <div className={`alert alert-${alertState.type} alert-dismissible fade show`} role="alert">
      {alertState.message}
      {/* El botón de cierre manual (si lo deseas) */}
      <button
        type="button"
        className="btn-close"
        onClick={() => {
          /*
             Aquí podríamos exponer una función para cerrar la alerta
             o hacer algo. Pero como la cierra sola el hook
             (con el setTimeout), basta con ignorar o pasar
             una callback que cambie el alertState.
          */
        }}
        aria-label="Close"
      />
    </div>
  );
};