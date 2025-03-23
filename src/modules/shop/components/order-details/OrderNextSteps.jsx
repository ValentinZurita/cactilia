export const OrderNextSteps = () => {
  return (
    <div className="order-next-steps">
      <h3>¿Qué sigue?</h3>
      <div className="next-steps-container">
        <div className="next-step-item">
          <div className="step-number">1</div>
          <div className="step-content">
            <h5>Confirmación por correo</h5>
            <p>Recibirás un correo de confirmación con los detalles de tu pedido en breve.</p>
          </div>
        </div>
        <div className="next-step-item">
          <div className="step-number">2</div>
          <div className="step-content">
            <h5>Procesamiento del pedido</h5>
            <p>Tu pedido será procesado y preparado para envío en las próximas 24-48 horas.</p>
          </div>
        </div>
        <div className="next-step-item">
          <div className="step-number">3</div>
          <div className="step-content">
            <h5>Envío y seguimiento</h5>
            <p>Cuando tu pedido sea enviado, recibirás un correo con la información de seguimiento.</p>
          </div>
        </div>
        <div className="next-step-item">
          <div className="step-number">4</div>
          <div className="step-content">
            <h5>Recibe tu pedido</h5>
            <p>¡Disfruta tu compra! No olvides que puedes revisar el estado de tu pedido en cualquier momento.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
