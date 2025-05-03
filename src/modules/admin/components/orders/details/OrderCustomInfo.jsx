const IconCircle = ({ icon, className = '', ...props }) => (
  <div
    className={`rounded-circle bg-light p-2 d-flex align-items-center justify-content-center me-3 ${className}`}
    style={{ width: '42px', height: '42px', minWidth: '42px' }}
    {...props}
  >
    <i className={`bi bi-${icon} text-secondary`}></i>
  </div>
);

const InfoBlock = ({ title, children }) => (
  <div className="mb-4">
    <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">{title}</h6>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div>
    <p className="mb-0 small text-secondary">{label}</p>
    <p className="mb-0 user-select-all">{value}</p>
  </div>
);

export const OrderCustomerInfo = ({ order }) => (

  <div className="row g-4">

    {/* Información del cliente */}
    <div className="col-md-6">
      <InfoBlock title="Información del cliente">
        <div className="d-flex align-items-center mb-3">
          <IconCircle icon="person" />
          <InfoRow label="ID Cliente" value={order.userId} />
        </div>

        {/* Notas del cliente */}
        {order.notes && (
          <div className="mt-4">
            <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Notas del cliente</h6>
            <div className="bg-light p-3 rounded-3 border-start border-4 border-secondary">
              <p className="mb-0">{order.notes}</p>
            </div>
          </div>
        )}
      </InfoBlock>

    </div>

    {/* Dirección de envío */}
    <div className="col-md-6">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Dirección de envío</h6>

      {order.shippingAddress ? (
        <div className="d-flex align-items-start">
          <IconCircle icon="geo-alt" className="mt-1" />
          <address className="mb-0">
            <span className="d-block fw-normal mb-1">{order.shippingAddress.name}</span>
            <span className="d-block">
              {order.shippingAddress.street}
              {order.shippingAddress.numExt && ` #${order.shippingAddress.numExt}`}
              {order.shippingAddress.numInt && `, Int. ${order.shippingAddress.numInt}`}
            </span>
            {order.shippingAddress.colonia && <span className="d-block">{order.shippingAddress.colonia}</span>}
            <span className="d-block">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</span>

            {order.shippingAddress.references && (
              <div className="mt-2 text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                Referencias: {order.shippingAddress.references}
              </div>
            )}
          </address>
        </div>
      ) : (
        <div className="d-flex align-items-center text-muted">
          <IconCircle icon="geo-alt" />
          <p className="mb-0 small">No hay información de dirección disponible</p>
        </div>
      )}

      {/* Si existe, podríamos mostrar email o teléfono */}
      {order.shipping && order.shipping.contact && (
        <div className="mt-4">
          <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Información de contacto</h6>

          {order.shipping.contact.email && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-envelope text-secondary me-2"></i>
              <span>{order.shipping.contact.email}</span>
            </div>
          )}

          {order.shipping.contact.phone && (
            <div className="d-flex align-items-center">
              <i className="bi bi-telephone text-secondary me-2"></i>
              <span>{order.shipping.contact.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);