import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusChanger } from './OrderStatusChanger';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderNotes } from './OrderNotes';

/**
 * Componente para mostrar los detalles completos de un pedido
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
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        No se encontró información del pedido.
      </div>
    );
  }

  return (
    <div className="order-detail">
      {/* Encabezado con ID, fecha y estado */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <button className="btn btn-outline-secondary mb-3" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver a la lista
          </button>
          <h4>
            Pedido #{order.id}
            <OrderStatusBadge status={order.status} className="ms-3" />
          </h4>
          <p className="text-muted">
            Creado el {formatDate(order.createdAt)}
          </p>
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

      <div className="row">
        {/* Columna izquierda: Información del pedido */}
        <div className="col-lg-8">
          {/* Productos en el pedido */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-box me-2"></i>
                Productos
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
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
                            className="img-thumbnail"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td>{item.name}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                  </tbody>
                  <tfoot className="table-light">
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
                        : <span className="text-success">Gratis</span>
                      }
                    </td>
                  </tr>
                  {order.totals.discount > 0 && (
                    <tr>
                      <td colSpan="4" className="text-end"><strong>Descuento:</strong></td>
                      <td className="text-end text-success">-{formatPrice(order.totals.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                    <td className="text-end"><strong>{formatPrice(order.totals.total)}</strong></td>
                  </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Información de cliente */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>
                Información del Cliente
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Datos de Contacto</h6>
                  <p className="mb-1">
                    <strong>ID Cliente:</strong> {order.userId}
                  </p>
                  {/* Aquí podrías añadir más información del cliente si la obtienes */}
                </div>
                <div className="col-md-6">
                  <h6>Dirección de Envío</h6>
                  {order.shipping && order.shipping.address ? (
                    <address>
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
                          <em>Referencias: {order.shipping.address.references}</em><br />
                        </>
                      )}
                    </address>
                  ) : (
                    <p className="text-muted">No hay información de dirección disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información de pago */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Información de Pago
              </h5>
            </div>
            <div className="card-body">
              {order.payment ? (
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Método:</strong> {order.payment.method?.brand
                      ? `${order.payment.method.brand} terminada en ${order.payment.method.last4}`
                      : 'Método de pago estándar'}
                    </p>
                    <p className="mb-1">
                      <strong>Estado:</strong> {order.payment.status || "Procesado"}
                    </p>
                    {order.payment.paymentIntentId && (
                      <p className="mb-1">
                        <strong>ID de Transacción:</strong> {order.payment.paymentIntentId}
                      </p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {/* Información de facturación si existe */}
                    {order.billing?.requiresInvoice && (
                      <div>
                        <h6>Información de Facturación</h6>
                        {order.billing.fiscalData && (
                          <>
                            <p className="mb-1">
                              <strong>RFC:</strong> {order.billing.fiscalData.rfc}
                            </p>
                            <p className="mb-1">
                              <strong>Razón Social:</strong> {order.billing.fiscalData.businessName}
                            </p>
                            <p className="mb-1">
                              <strong>Email:</strong> {order.billing.fiscalData.email}
                            </p>
                            <p className="mb-1">
                              <strong>Uso CFDI:</strong> {order.billing.fiscalData.usoCFDI}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted">No hay información de pago disponible</p>
              )}
            </div>
          </div>

          {/* Notas del pedido */}
          {order.notes && (
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Notas del Cliente
                </h5>
              </div>
              <div className="card-body">
                <blockquote className="blockquote">
                  <p className="mb-0">{order.notes}</p>
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Historial y Notas */}
        <div className="col-lg-4">
          {/* Historial de estados */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <OrderStatusHistory
                history={order.statusHistory || []}
                formatDate={formatDate}
              />
            </div>
          </div>

          {/* Notas administrativas */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <OrderNotes
                notes={order.adminNotes || []}
                onAddNote={onAddNote}
                formatDate={formatDate}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};