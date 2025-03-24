export const OrderItemsTable = ({ order, formatPrice }) => (
  <div className="card border-0 shadow-sm rounded-4">
    <div className="card-header bg-white border-0 py-3">
      <h5 className="mb-0 fw-normal d-flex align-items-center">
        <i className="bi bi-box me-2 text-secondary"></i>
        Productos del pedido
      </h5>
    </div>
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table mb-0">
          <thead className="table-light">
          <tr>
            <th className="fw-normal" style={{ width: '60px' }}></th>
            <th className="fw-normal">Producto</th>
            <th className="fw-normal">Precio</th>
            <th className="fw-normal">Cantidad</th>
            <th className="fw-normal text-end">Total</th>
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
              <td><span>{item.name}</span></td>
              <td>{formatPrice(item.price)}</td>
              <td><span className="badge bg-light text-dark rounded-pill px-3 py-1">{item.quantity}</span></td>
              <td className="text-end fw-normal">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
          </tbody>
          <tfoot className="table-light">
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal">Subtotal:</span></td>
            <td className="text-end">{formatPrice(order.totals.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal">Impuestos:</span></td>
            <td className="text-end">{formatPrice(order.totals.tax)}</td>
          </tr>
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal">Envío:</span></td>
            <td className="text-end">
              {order.totals.shipping > 0
                ? formatPrice(order.totals.shipping)
                : <span className="badge bg-success bg-opacity-10 text-success px-3 py-1">Gratis</span>
              }
            </td>
          </tr>
          {order.totals.discount > 0 && (
            <tr>
              <td colSpan="4" className="text-end"><span className="fw-normal">Descuento:</span></td>
              <td className="text-end text-success">-{formatPrice(order.totals.discount)}</td>
            </tr>
          )}
          <tr>
            <td colSpan="4" className="text-end"><span className="fw-normal fs-5">Total:</span></td>
            <td className="text-end fw-normal fs-5">{formatPrice(order.totals.total)}</td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);
