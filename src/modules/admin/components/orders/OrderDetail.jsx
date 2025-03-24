import React, { useState } from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusChanger } from './OrderStatusChanger';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderNotes } from './OrderNotes';

/**
 * Componente para mostrar los detalles completos de un pedido
 * Mantiene los componentes modulares con mejor organización visual
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
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('products');

  if (!order) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 text-center">
          <i className="bi bi-exclamation-circle text-secondary opacity-50 fs-1 mb-3"></i>
          <h5 className="text-secondary">No se encontró información del pedido</h5>
          <button
            className="btn btn-outline-secondary mt-3"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left me-2"></i>Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail">
      {/* Cabecera principal con información clave del pedido */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                <h4 className="mb-0 fw-normal">Pedido #{order.id.slice(0, 8)}...</h4>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="text-secondary small">
                Creado el {formatDate(order.createdAt)}
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
              <div className="me-auto me-md-0">
                <span className="text-secondary small d-block mb-1">Total del pedido</span>
                <span className="fs-4 fw-normal">{formatPrice(order.totals.total)}</span>
              </div>
              <button
                className="btn btn-outline-secondary ms-3"
                onClick={onBack}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="bi bi-box me-2"></i>
            Productos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
          >
            <i className="bi bi-person me-2"></i>
            Cliente
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <i className="bi bi-credit-card me-2"></i>
            Pago
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <i className="bi bi-clock-history me-2"></i>
            Historial
          </button>
        </li>
      </ul>

      {/* Contenido según la pestaña seleccionada */}
      <div className="tab-content mb-4">
        {/* Pestaña de productos */}
        {activeTab === 'products' && (
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
        )}

        {/* Pestaña de cliente */}
        {activeTab === 'customer' && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-normal d-flex align-items-center">
                <i className="bi bi-person me-2 text-secondary"></i>
                Información del cliente
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {/* Información del cliente */}
                <div className="col-md-6">
                  <div className="mb-4">
                    <h6 className="text-secondary mb-3">ID Cliente</h6>
                    <div className="bg-light p-3 rounded-3">
                      <span className="user-select-all">{order.userId}</span>
                    </div>
                  </div>

                  {/* Notas del cliente */}
                  {order.notes && (
                    <div>
                      <h6 className="text-secondary mb-3">Notas del cliente</h6>
                      <div className="bg-light p-3 rounded-3">
                        <p className="mb-0">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dirección de envío */}
                <div className="col-md-6">
                  <h6 className="text-secondary mb-3">Dirección de envío</h6>
                  {order.shipping && order.shipping.address ? (
                    <div className="bg-light p-3 rounded-3">
                      <address className="mb-0">
                        <span className="fw-normal">{order.shipping.address.name}</span><br />
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
                          <div className="mt-2 text-muted small">
                            <i className="bi bi-info-circle me-1"></i>
                            Referencias: {order.shipping.address.references}
                          </div>
                        )}
                      </address>
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">No hay información de dirección disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña de pago */}
        {activeTab === 'payment' && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-normal d-flex align-items-center">
                <i className="bi bi-credit-card me-2 text-secondary"></i>
                Información de pago
              </h5>
            </div>
            <div className="card-body">
              {order.payment ? (
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="text-secondary mb-3">Método de pago</h6>
                    <div className="bg-light p-3 rounded-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-credit-card me-2 text-secondary"></i>
                        <span>
                          {order.payment.method?.brand
                            ? `${order.payment.method.brand} terminada en ${order.payment.method.last4}`
                            : 'Método de pago estándar'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success px-3 py-1">
                          {order.payment.status || "Procesado"}
                        </span>
                      </div>
                    </div>

                    {order.payment.paymentIntentId && (
                      <div className="mt-4">
                        <h6 className="text-secondary mb-3">ID de transacción</h6>
                        <div className="bg-light p-3 rounded-3">
                          <code className="user-select-all">{order.payment.paymentIntentId}</code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información de facturación */}
                  {order.billing?.requiresInvoice && order.billing.fiscalData && (
                    <div className="col-md-6">
                      <h6 className="text-secondary mb-3">Datos de facturación</h6>
                      <div className="bg-light p-3 rounded-3">
                        <div className="mb-2">
                          <span className="text-secondary">RFC:</span>
                          <span className="ms-2">{order.billing.fiscalData.rfc}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary">Razón Social:</span>
                          <span className="ms-2">{order.billing.fiscalData.businessName}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-secondary">Email:</span>
                          <span className="ms-2">{order.billing.fiscalData.email}</span>
                        </div>
                        <div>
                          <span className="text-secondary">Uso CFDI:</span>
                          <span className="ms-2">{order.billing.fiscalData.usoCFDI}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-credit-card d-block mb-2 text-secondary opacity-50 fs-4"></i>
                  <p className="mb-0 text-muted">No hay información de pago disponible</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pestaña de historial y estado */}
        {activeTab === 'status' && (
          <div className="row g-4">
            {/* Cambiador de estado */}
            <div className="col-md-5">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 fw-normal d-flex align-items-center">
                    <i className="bi bi-arrow-repeat me-2 text-secondary"></i>
                    Cambiar estado
                  </h5>
                </div>
                <div className="card-body">
                  <OrderStatusChanger
                    currentStatus={order.status}
                    onChangeStatus={(status, notes) => {
                      onChangeStatus(status, notes);
                    }}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>

              {/* Notas administrativas */}
              <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 fw-normal d-flex align-items-center">
                    <i className="bi bi-journal-text me-2 text-secondary"></i>
                    Notas administrativas
                  </h5>
                </div>
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

            {/* Historial de estados */}
            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 fw-normal d-flex align-items-center">
                    <i className="bi bi-clock-history me-2 text-secondary"></i>
                    Historial de estados
                  </h5>
                </div>
                <div className="card-body">
                  <OrderStatusHistory
                    history={order.statusHistory || []}
                    formatDate={formatDate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};