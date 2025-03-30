export const OrderSummaryHeader = ({
                                     title = "¡Pedido Confirmado!",
                                     message = "Gracias por tu compra. Tu pedido ha sido procesado correctamente.",
                                     showIcon = true
                                   }) => {
  return (
    <div className="order-success-header">
      {showIcon && (
        <div className="success-icon-container">
          <i className="bi bi-check-circle-fill"></i>
        </div>
      )}
      <h1>{title}</h1>
      {message && <p className="lead">{message}</p>}
    </div>
  );
};