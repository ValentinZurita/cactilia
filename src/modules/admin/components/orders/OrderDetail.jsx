import React, { useState, useEffect } from 'react';
import { OrderDetailHeader } from './OrderDetailHeader';
import { OrderDetailTabs } from './OrderDetailTabs';
import { OrderPaymentInfo } from './OrderPaymentInfo';
import { OrderStatusChangeSection } from './OrderStatusChangeSection';
import { OrderNotes } from './OrderNotes';
import { OrderCustomerInfo } from './OrderCustomInfo.jsx';
import { OrderItemsTable } from './OrderItemTable.jsx';
import { getUserById } from './userAdminService.js';
import { OrderEmailStatus } from './OrderEmailStatus.jsx'

export const OrderDetail = ({
                              order,
                              onBack,
                              onChangeStatus,
                              onAddNote,
                              onOrderUpdate, // Nueva prop para actualizar el pedido
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

  return (
    <div className="order-detail">

      {/* Cabecera principal con información clave del pedido */}
      <OrderDetailHeader
        order={order}
        onBack={onBack}
        formatDate={formatDate}
        formatPrice={formatPrice}
        userData={userData} // Pasar datos del usuario a la cabecera
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
            onOrderUpdate={onOrderUpdate} // Pasar la función
          />
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

        {/* Sección para estado de emails */}
        <div className="col-md-6 mt-4">
          <OrderEmailStatus
            order={order}
            onEmailSent={onOrderUpdate}
          />
        </div>

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