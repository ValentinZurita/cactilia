import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { OrderDetailHeader } from './OrderDetailHeader.jsx';
import { OrderPaymentInfo } from '../payment/OrderPaymentInfo.jsx';
import { OrderStatusChangeSection } from '../status/OrderStatusChangeSection.jsx';
import { OrderNotes } from '../notes/OrderNotes.jsx';
import { OrderCustomerInfo } from './OrderCustomInfo.jsx';
import { OrderItemsTable } from './OrderItemTable.jsx';
import { OrderWorkflow } from '../workflow/OrderWorkflow.jsx';
import { OrderDetailTabs } from './OrderDetailTabs.jsx';
import { getUserById } from '../services/userAdminService.js';

// Importaciones de Redux
import {
  updateOrderStatusThunk,
  addOrderNoteThunk,
  fetchOrderById
} from '../thunks/orderThunks.js';
import {
  selectActionProcessing
} from '../thunks/orderSelectors.js';
import { addMessage } from '../../../../../store/messages/messageSlice.js';

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

  // Obtener estado de procesamiento desde Redux
  // (podemos usar el pasado por props o este directamente de Redux)
  const processingFromRedux = useSelector(selectActionProcessing);
  const dispatch = useDispatch();
  const { uid } = useSelector(state => state.auth);

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

  // Versión Redux del manejador para cambiar estado
  const handleChangeStatusRedux = async (status, notes) => {
    if (order && order.id && uid) {
      await dispatch(updateOrderStatusThunk({
        orderId: order.id,
        newStatus: status,
        adminId: uid,
        notes
      }));
    }
  };

  // Versión Redux del manejador para añadir nota
  const handleAddNoteRedux = async (noteText) => {
    if (order && order.id && uid) {
      await dispatch(addOrderNoteThunk({
        orderId: order.id,
        noteText,
        adminId: uid
      }));
    }
  };

  // Versión Redux del manejador para actualizar datos
  const handleOrderUpdateRedux = async () => {
    if (order && order.id) {
      await dispatch(fetchOrderById(order.id));

      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Información actualizada correctamente',
        autoHide: true,
        duration: 3000
      }));
    }
  };

  // Función que maneja las actualizaciones desde el flujo de trabajo
  const handleWorkflowUpdate = () => {
    // Usar las funciones proporcionadas por props si existen o las versiones Redux
    if (onOrderUpdate) {
      onOrderUpdate();
    } else {
      handleOrderUpdateRedux();
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
            onOrderUpdate={onOrderUpdate || handleOrderUpdateRedux}
          />
        )}

        {/* Pestaña de flujo de trabajo */}
        {activeTab === 'workflow' && (
          <OrderWorkflow
            order={order}
            onOrderUpdate={handleWorkflowUpdate}
          />
        )}

        {/* Pestaña de historial y estado */}
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
            onAddNote={onAddNote || handleAddNoteRedux}
            formatDate={formatDate}
            isProcessing={isProcessing || processingFromRedux}
          />
        )}
      </div>
    </div>
  );
};