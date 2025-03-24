import React, { useState } from 'react';
import { OrderDetailHeader } from './OrderDetailHeader';
import { OrderDetailTabs } from './OrderDetailTabs';
import { OrderPaymentInfo } from './OrderPaymentInfo';
import { OrderStatusChangeSection } from './OrderStatusChangeSection';
import { OrderNotes } from './OrderNotes';
import { OrderCustomerInfo } from './OrderCustomInfo.jsx'
import { AdminCard } from './AdminCard.jsx'
import { OrderItemsTable } from './OrderItemTable.jsx'

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

  // Si no hay pedido, mostrar mensaje
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
      <OrderDetailHeader
        order={order}
        onBack={onBack}
        formatDate={formatDate}
        formatPrice={formatPrice}
      />

      {/* Navegación por pestañas */}
      <OrderDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido según la pestaña seleccionada */}
      <div className="tab-content mb-4">
        {/* Pestaña de productos - Ahora sin card, más minimalista */}
        {activeTab === 'products' && (
          <OrderItemsTable order={order} formatPrice={formatPrice} />
        )}

        {/* Pestaña de cliente */}
        {activeTab === 'customer' && (
          <OrderCustomerInfo order={order} />
        )}

        {/* Pestaña de pago */}
        {activeTab === 'payment' && (
          <OrderPaymentInfo order={order} />
        )}

        {/* Pestaña de historial y estado */}
        {activeTab === 'status' && (
          <OrderStatusChangeSection
            order={order}
            onChangeStatus={onChangeStatus}
            formatDate={formatDate}
            isProcessing={isProcessing}
          />
        )}

        {/* Pestaña para notas administrativas */}
        {activeTab === 'notes' && (
          <div>
            <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Notas administrativas</h6>
            <OrderNotes
              notes={order.adminNotes || []}
              onAddNote={onAddNote}
              formatDate={formatDate}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
};