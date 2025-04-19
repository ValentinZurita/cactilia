export const OrderItemsTable = ({ order, formatPrice }) => (
  <div className="order-items">
    {/* Título simple sin ícono */}
    <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Productos del pedido</h6>

    <div className="table-responsive">
      <table className="table">
        <thead>
        <tr>
          <th className="fw-normal text-secondary border-0" style={{ width: '60px' }}></th>
          <th className="fw-normal text-secondary border-0">Producto</th>
          <th className="fw-normal text-secondary border-0">Precio</th>
          <th className="fw-normal text-secondary border-0">Cantidad</th>
          <th className="fw-normal text-secondary border-0 text-end">Total</th>
        </tr>
        </thead>
        <tbody>
        {order.items.map((item, index) => (
          <tr key={index}>
            <td>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="rounded"
                  style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                />
              ) : (
                <div className="bg-light rounded d-flex align-items-center justify-content-center"
                     style={{ width: '45px', height: '45px' }}>
                  <i className="bi bi-image text-secondary"></i>
                </div>
              )}
            </td>
            <td className="text-secondary">{item.name}</td>
            <td className="text-secondary">{formatPrice(item.price)}</td>
            <td className="text-secondary">{item.quantity}</td>
            <td className="text-end text-secondary">{formatPrice(item.price * item.quantity)}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>

    {/* Resumen de totales en formato más minimalista */}
    <div className="totals-section border-top pt-3 mt-3">
      <div className="row mb-2">
        <div className="col text-end text-secondary small">Subtotal:</div>
        <div className="col-auto text-secondary">{formatPrice(order.totals?.subtotal || 0)}</div>
      </div>

      <div className="row mb-2">
        <div className="col text-end text-secondary small">Impuestos:</div>
        <div className="col-auto text-secondary">{formatPrice(order.totals?.taxes || 0)}</div>
      </div>

      <div className="row mb-2">
        <div className="col text-end text-secondary small">Envío:</div>
        <div className="col-auto">
          {(order.totals?.shipping || 0) > 0
            ? <span className="text-secondary">{formatPrice(order.totals.shipping)}</span>
            : <span className="text-success small">Gratis</span>
          }
        </div>
      </div>

      {(order.totals?.discount || 0) > 0 && (
        <div className="row mb-2">
          <div className="col text-end text-secondary small">Descuento:</div>
          <div className="col-auto text-success">-{formatPrice(order.totals.discount)}</div>
        </div>
      )}

      <div className="row fw-medium">
        <div className="col text-end text-secondary">Total:</div>
        <div className="col-auto text-secondary">{formatPrice(order.totals?.finalTotal || 0)}</div>
      </div>
    </div>
  </div>
);