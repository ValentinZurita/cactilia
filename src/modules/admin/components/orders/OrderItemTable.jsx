export const OrderItemsTable = ({ order, formatPrice }) => (
  <div className="card border-0 shadow-sm rounded-4">
    <div className="card-header bg-white border-0 py-3">
      <h5 className="mb-0 fw-normal d-flex align-items-center">
        <i className="bi bi-box me-2 text-primary"></i>
        <span className="text-secondary">Productos del pedido</span>
      </h5>
    </div>
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table mb-0">
          <thead className="table-light">
          <tr>
            <th className="fw-normal text-secondary" style={{ width: '60px' }}></th>
            <th className="fw-normal text-secondary">Producto</th>
            <th className="fw-normal text-secondary">Precio</th>
            <th className="fw-normal text-secondary">Cantidad</th>
            <th className="fw-normal text-secondary text-end">Total</th>
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
                    className="rounded-3"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-image text-secondary"></i>
                  </div>
                )}
              </td>
              <td><span className="text-secondary">{item.name}</span></td>
              <td className="text-secondary">{formatPrice(item.price)}</td>
              <td><span className="badge bg-light text-secondary rounded-pill px-3 py-1">{item.quantity}</span></td>
              <td className="text-end fw-normal text-secondary">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
          </tbody>
          <tfoot className="table-light">
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal text-secondary">Subtotal:</span></td>
            <td className="text-end text-secondary">{formatPrice(order.totals.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal text-secondary">Impuestos:</span></td>
            <td className="text-end text-secondary">{formatPrice(order.totals.tax)}</td>
          </tr>
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal text-secondary">Envío:</span></td>
            <td className="text-end">
              {order.totals.shipping > 0
                ? <span className="text-secondary">{formatPrice(order.totals.shipping)}</span>
                : <span className="badge bg-success-subtle text-success px-3 py-1">Gratis</span>
              }
            </td>
          </tr>
          {order.totals.discount > 0 && (
            <tr>
              <td colSpan="4" className="text-end"><span className="fw-normal text-secondary">Descuento:</span></td>
              <td className="text-end text-success">-{formatPrice(order.totals.discount)}</td>
            </tr>
          )}
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal fs-5 text-secondary">Total:</span></td>
            <td className="text-end fw-normal fs-5 text-secondary">{formatPrice(order.totals.total)}</td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);