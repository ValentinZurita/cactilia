import React, { useState, useEffect } from 'react';
import { OrderDetailHeader } from './OrderDetailHeader';
import { OrderPaymentInfo } from './OrderPaymentInfo';
import { OrderStatusChangeSection } from './OrderStatusChangeSection';
import { OrderNotes } from './OrderNotes';
import { OrderCustomerInfo } from './OrderCustomInfo';
import { OrderItemsTable } from './OrderItemTable';
import { getUserById } from './userAdminService';
import { OrderWorkflow } from './workflow/OrderWorkflow.jsx'
import { OrderDetailTabs } from './OrderDetailTabs.jsx'

export const OrderDetail = ({
                              order,
                              onBack,
                              onChangeStatus,
                              onAddNote,
                              onOrderUpdate,
                              formatPrice,
                              formatDate,
                              isProcessing = false
                            }) => {

  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('products');

  // Estado para almacenar los datos del usuario
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Cargar información del usuario cuando cambia el pedido
  useEffect(() => {
    const fetchUserData = async () => {
      if (order && order.userId) {
        setLoadingUser(true);
        try {
          const result = await getUserById(order.userId);
          if (result.ok) {
            setUserData(result.data);
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
        } finally {
          setLoadingUser(false);
        }
      }
    };

    fetchUserData();
  }, [order]);

  // Si no hay pedido, mostrar mensaje
  if (!order) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 text-center">
          <i className="bi bi-exclamation-circle text-secondary opacity-50 fs-1 mb-3"></i>
          <h5>No se encontró información del pedido</h5>
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

  // Función que maneja las actualizaciones desde el flujo de trabajo
  const handleWorkflowUpdate = () => {
    if (onOrderUpdate) {
      onOrderUpdate();
    }
  };

  return (
    <div className="order-detail">
      {/* Cabecera principal con información clave del pedido */}
      <OrderDetailHeader
        order={order}
        onBack={onBack}
        formatDate={formatDate}
        formatPrice={formatPrice}
        userData={userData}
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
          <OrderCustomerInfo order={order} userData={userData} loadingUser={loadingUser} />
        )}

        {/* Pestaña de pago */}
        {activeTab === 'payment' && (
          <OrderPaymentInfo
            order={order}
            onOrderUpdate={onOrderUpdate}
          />
        )}

        {/* Nueva pestaña de flujo de trabajo */}
        {activeTab === 'workflow' && (
          <OrderWorkflow
            order={order}
            onOrderUpdate={handleWorkflowUpdate}
          />
        )}

        {/* Pestaña de historial y estado - Modificada */}
        {activeTab === 'status' && (
          <OrderStatusChangeSection
            order={order}
            formatDate={formatDate}
          />
        )}


        {/* Pestaña para notas administrativas */}
        {activeTab === 'notes' && (
          <OrderNotes
            notes={order.adminNotes || []}
            onAddNote={onAddNote}
            formatDate={formatDate}
            isProcessing={isProcessing}
          />
        )}

      </div>
    </div>
  );
};