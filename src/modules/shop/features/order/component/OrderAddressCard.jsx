export const OrderAddressCard = ({ address, estimatedDelivery }) => {
  if (!address) {
    return (
      <p className="text-muted">No hay información de dirección disponible</p>
    );
  }

  return (
    <div className="order-address-card">
      <div className="address-name">{address.name}</div>
      <address>
        {address.street}
        {address.numExt && ` #${address.numExt}`}
        {address.numInt && `, Int. ${address.numInt}`}
        <br />
        {address.colonia && (
          <>
            {address.colonia}
            <br />
          </>
        )}
        {address.city}, {address.state} {address.zip}
        {address.references && (
          <>
            <br />
            <span className="references">
              <i className="bi bi-info-circle me-1"></i>
              {address.references}
            </span>
          </>
        )}
      </address>
      <div className="delivery-estimate">
        <i className="bi bi-calendar-check me-2"></i>
        Entrega estimada: {estimatedDelivery || 'En proceso de cálculo'}
      </div>
    </div>
  );
};
