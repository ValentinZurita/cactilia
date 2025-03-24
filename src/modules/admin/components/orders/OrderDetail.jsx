import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusChanger } from './OrderStatusChanger';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderNotes } from './OrderNotes';

/**
 * Componente para mostrar los detalles completos de un pedido
 * Con diseño mejorado y mejor experiencia de usuario
 *
 * @param {Object} props
 * @param {Object} props.order - Datos del pedido
 * @param {Function} props.onBack - Función para volver a la lista
 * @param {Function} props.onChangeStatus - Función para cambiar el estado
 * @param {Function} props.onAddNote - Función para añadir nota
 * @param {Function} props.formatPrice - Función para formatear precios
 * @param {Function} props.formatDate - Función para formatear fechas
 * @param {boolean} props.isProcessing - Indica si hay una operación en proceso
 */
export const OrderDetail = ({
                              order,
                              onBack,
                              onChangeStatus,
                              onAddNote,
                              formatPrice,
                              formatDate,
                              isProcessing = false
                            }) => {
  if (!order) {
    return (
      <div className="alert alert-warning rounded-4 d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
        <div>No se encontró información del pedido.</div>
      </div>
    );
  }

  return (
    <div className="order-detail">
      {/* Encabezado con ID, fecha y estado */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-0">
          <div className="d-flex flex-column flex-md-row justify-content-between p-4">
            <div>
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill mb-3 d-flex align-items-center px-3"
                onClick={onBack}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a la lista
              </button>
              <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                <h4 className="mb-0 me-2">
                  Pedido #{order.id.slice(0, 8)}...
                </h4>
                <OrderStatusBadge status={order.status} className="ms-md-2" />
              </div>
              <p className="text-muted mb-0 d-flex align-items-center">
                <i className="bi bi-calendar3 me-2"></i>
                Creado el {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="mt-3 mt-md-0 text-md-end">
              <div className="bg-light rounded-3 p-3 d-inline-block">
                <span className="d-block text-muted small">Total del pedido</span>
                <span className="fs-3 fw-bold text-primary">
                  {formatPrice(order.totals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cambiador de estado */}
      <OrderStatusChanger
        currentStatus={order.status}
        onChangeStatus={(status, notes) => {
          console.log('OrderDetail: Recibiendo cambio de estado a', status, 'con notas:', notes);
          onChangeStatus(status, notes);
        }}
        isProcessing={isProcessing}
      />

      <div className="row g-4">
        {/* Columna izquierda: Información del pedido */}
        <div className="col-lg-8">
          {/* Productos en el pedido */}
          <div className="card mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-light border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-box me-2 text-primary"></i>
                Productos
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                  <tr>
                    <th style={{ width: '60px' }}></th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th className="text-end">Total</th>
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
                            className="img-thumbnail rounded-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td><span className="fw-medium">{item.name}</span></td>
                      <td>{formatPrice(item.price)}</td>
                      <td><span className="badge bg-light text-dark rounded-pill px-3 py-2">{item.quantity}</span></td>
                      <td className="text-end fw-bold">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                  </tbody>
                  <tfoot className="table-light fw-medium">
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Subtotal:</strong></td>
                    <td className="text-end">{formatPrice(order.totals.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Impuestos:</strong></td>
                    <td className="text-end">{formatPrice(order.totals.tax)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Envío:</strong></td>
                    <td className="text-end">
                      {order.totals.shipping > 0
                        ? formatPrice(order.totals.shipping)
                        : <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">Gratis</span>
                      }
                    </td>
                  </tr>
                  {order.totals.discount > 0 && (
                    <tr>
                      <td colSpan="4" className="text-end"><strong>Descuento:</strong></td>
                      <td className="text-end text-success">-{formatPrice(order.totals.discount)}</td>
                    </tr>
                  )}
                  <tr className="fs-5">
                    <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                    <td className="text-end"><strong>{formatPrice(order.totals.total)}</strong></td>
                  </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Información de cliente */}
            <div className="col-md-6">
              <div className="card mb-4 border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-light border-0 py-3">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i className="bi bi-person me-2 text-primary"></i>
                    Información del Cliente
                  </h5>
                </div>
                <div className="card-body">
                  <div className="user-info mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-light rounded-circle p-3 me-3">
                        <i className="bi bi-person-circle fs-4 text-primary"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">ID Cliente:</h6>
                        <p className="mb-0 badge bg-light text-dark px-3 py-2">
                          {order.userId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h6 className="text-primary mb-3">Dirección de Envío</h6>
                  {order.shipping && order.shipping.address ? (
                    <div className="p-3 bg-light rounded-3">
                      <address className="mb-0">
                        <strong>{order.shipping.address.name}</strong><br />
                        {order.shipping.address.street}
                        {order.shipping.address.numExt && ` #${order.shipping.address.numExt}`}
                        {order.shipping.address.numInt && `, Int. ${order.shipping.address.numInt}`}<br />
                        {order.shipping.address.colonia && (
                          <>
                            {order.shipping.address.colonia}<br />
                          </>
                        )}
                        {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zip}<br />
                        {order.shipping.address.references && (
                          <>
                            <div className="mt-2 text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              <em>Referencias: {order.shipping.address.references}</em>
                            </div>
                          </>
                        )}
                      </address>
                    </div>
                  ) : (
                    <p className="text-muted">No hay información de dirección disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de pago */}
            <div className="col-md-6">
              <div className="card mb-4 border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-light border-0 py-3">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i className="bi bi-credit-card me-2 text-primary"></i>
                    Información de Pago
                  </h5>
                </div>
                <div className="card-body">
                  {order.payment ? (
                    <div>
                      <div className="payment-method mb-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-light rounded-circle p-3 me-3">
                            <i className="bi bi-credit-card fs-4 text-primary"></i>
                          </div>
                          <div>
                            <h6 className="mb-1">Método de Pago:</h6>
                            <p className="mb-0 badge bg-light text-dark px-3 py-2">
                              {order.payment.method?.brand
                                ? `${order.payment.method.brand} terminada en ${order.payment.method.last4}`
                                : 'Método de pago estándar'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="payment-status mb-4">
                        <h6 className="text-primary mb-2">Estado del Pago:</h6>
                        <div className="p-3 bg-light rounded-3">
                          <span className="badge bg-success px-3 py-2">
                            {order.payment.status || "Procesado"}
                          </span>
                        </div>
                      </div>

                      {order.payment.paymentIntentId && (
                        <div className="transaction-id">
                          <h6 className="text-primary mb-2">ID de Transacción:</h6>
                          <div className="p-3 bg-light rounded-3">
                            <code className="user-select-all">{order.payment.paymentIntentId}</code>
                          </div>
                        </div>
                      )}

                      {/* Información de facturación si existe */}
                      {order.billing?.requiresInvoice && order.billing.fiscalData && (
                        <div className="mt-4 pt-3 border-top">
                          <h6 className="text-primary mb-3">Información de Facturación</h6>
                          <div className="p-3 bg-light rounded-3">
                            <p className="mb-2">
                              <strong>RFC:</strong> {order.billing.fiscalData.rfc}
                            </p>
                            <p className="mb-2">
                              <strong>Razón Social:</strong> {order.billing.fiscalData.businessName}
                            </p>
                            <p className="mb-2">
                              <strong>Email:</strong> {order.billing.fiscalData.email}
                            </p>
                            <p className="mb-0">
                              <strong>Uso CFDI:</strong> {order.billing.fiscalData.usoCFDI}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="bg-light rounded-4 p-4">
                        <i className="bi bi-credit-card d-block mb-3 fs-1 text-muted"></i>
                        <p className="mb-0 text-muted">No hay información de pago disponible.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notas del pedido */}
          {order.notes && (
            <div className="card mb-4 border-0 shadow-sm rounded-4">
              <div className="card-header bg-light border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-chat-left-text me-2 text-primary"></i>
                  Notas del Cliente
                </h5>
              </div>
              <div className="card-body">
                <blockquote className="blockquote bg-light p-4 rounded-4 border-start border-4 border-primary">
                  <i className="bi bi-quote fs-3 text-primary opacity-50 mb-2 d-block"></i>
                  <p className="mb-0">{order.notes}</p>
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Historial y Notas */}
        <div className="col-lg-4">
          {/* Historial de estados */}
          <div className="card mb-4 border-0 shadow-sm rounded-4">
            <div className="card-body">
              <OrderStatusHistory
                history={order.statusHistory || []}
                formatDate={formatDate}
              />
            </div>
          </div>

          {/* Notas administrativas */}
          <OrderNotes
            notes={order.adminNotes || []}
            onAddNote={onAddNote}
            formatDate={formatDate}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};