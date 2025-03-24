// ===============================
// src/modules/admin/components/orders/OrderDetail.jsx - Actualizado
// ===============================
import React, { useState } from 'react';
import { OrderDetailHeader } from './OrderDetailHeader';
import { OrderDetailTabs } from './OrderDetailTabs';
import { OrderPaymentInfo } from './OrderPaymentInfo';
import { OrderStatusChangeSection } from './OrderStatusChangeSection';
import { OrderNotes } from './OrderNotes';
import { OrderCustomerInfo } from './OrderCustomInfo.jsx'
import { AdminCard } from './AdminCard.jsx'
import { OrderItemsTable } from './OrderItemTable.jsx'


/**
 * Componente para mostrar los detalles completos de un pedido
 * Versión refactorizada con componentes más pequeños y modulares
 * Ahora con pestaña de notas separada
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
        {/* Pestaña de productos */}
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

        {/* Pestaña de historial y estado - Separada de las notas */}
        {activeTab === 'status' && (
          <OrderStatusChangeSection
            order={order}
            onChangeStatus={onChangeStatus}
            formatDate={formatDate}
            isProcessing={isProcessing}
          />
        )}

        {/* Nueva pestaña para notas administrativas */}
        {activeTab === 'notes' && (
          <AdminCard
            icon="journal-text"
            title="Notas administrativas"
          >
            <OrderNotes
              notes={order.adminNotes || []}
              onAddNote={onAddNote}
              formatDate={formatDate}
              isProcessing={isProcessing}
            />
          </AdminCard>
        )}
      </div>
    </div>
  );
};