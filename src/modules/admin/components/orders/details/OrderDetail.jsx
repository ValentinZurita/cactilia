import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  selectActionProcessing,
} from '../thunks/orderSelectors.js';
import { addMessage } from '../../../../../store/messages/messageSlice.js';

// Función auxiliar para leer el tab inicial de la URL
const getInitialTab = (search) => {
  const params = new URLSearchParams(search);
  const tabFromURL = params.get('tab');
  const validTabs = ['products', 'customer', 'payment', 'workflow', 'status', 'notes'];
  return validTabs.includes(tabFromURL) ? tabFromURL : 'products';
};

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
  // ELIMINADO: estado local de activeTab
  // const [activeTab, setActiveTab] = useState('products');

  // Estado para almacenar los datos del usuario
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Obtener estados desde Redux
  const processingFromRedux = useSelector(selectActionProcessing);
  const dispatch = useDispatch();
  const location = useLocation(); // NUEVO: para manejar URL
  const { uid } = useSelector(state => state.auth);

  // --- Estado local para la pestaña activa, inicializado desde URL --- 
  const [localActiveTab, setLocalActiveTab] = useState(() => getInitialTab(location.search));

  // --- Sincronizar URL -> Estado Local (para botones atrás/adelante) ---
  useEffect(() => {
    const tabFromURL = getInitialTab(location.search);
    if (tabFromURL !== localActiveTab) {
       console.log('[OrderDetail URL Sync Effect] Updating local state from URL:', tabFromURL);
       setLocalActiveTab(tabFromURL);
    }
    // Depender solo de location.search para detectar cambios externos
  }, [location.search]); // Quitar localActiveTab de aquí para evitar bucles si URL cambia

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

  // --- Actualizar Estado Local Y URL al hacer clic --- 
  const handleSetActiveTab = (tab) => {
    console.log('[OrderDetail handleSetActiveTab] Setting local state and URL tab:', tab);
    setLocalActiveTab(tab); // <-- Actualizar estado local PRIMERO

    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', tab);
    const newUrl = `${location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl); // Actualizar URL
    // setForceRenderKey(prevKey => prevKey + 1); // <-- Ya no se necesita
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

      {/* Pasar estado local y el manejador */}
      <OrderDetailTabs activeTab={localActiveTab} setActiveTab={handleSetActiveTab} />

      {/* Contenido según el estado local */}
      <div className="tab-content mb-4">
        {localActiveTab === 'products' && (
          <OrderItemsTable order={order} formatPrice={formatPrice} />
        )}
        {localActiveTab === 'customer' && (
          <OrderCustomerInfo order={order} userData={userData} loadingUser={loadingUser} />
        )}
        {localActiveTab === 'payment' && (
          <OrderPaymentInfo
            order={order}
            onOrderUpdate={onOrderUpdate || handleOrderUpdateRedux}
          />
        )}
        {localActiveTab === 'workflow' && (
          <OrderWorkflow
            order={order}
            onOrderUpdate={handleWorkflowUpdate}
          />
        )}
        {localActiveTab === 'status' && (
          <OrderStatusChangeSection
            order={order}
            formatDate={formatDate}
          />
        )}
        {localActiveTab === 'notes' && (
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