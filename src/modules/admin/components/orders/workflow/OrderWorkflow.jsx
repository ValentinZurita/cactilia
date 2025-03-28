import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { WorkflowStepper } from './WorkflowStepper';
import { NotificationHistory } from './NotificationHistory';
import { ProcessingForm } from './steps/ProcessingForm';
import { ShipmentForm } from './steps/ShipmentForm';
import { ResendShippingForm } from './steps/ResendShippingForm';
import { DeliveryForm } from './steps/DeliveryForm';
import { ConfirmationForm } from './steps/ConfirmationForm';
import { CancellationForm } from './steps/CancellationForm';
import { fetchOrderById } from '../thunks/orderThunks.js';

/**
 * Flujo de trabajo para procesar pedidos a través de sus diferentes etapas
 * Permite visualizar el progreso y realizar acciones en cada paso
 * Versión mejorada para actualizaciones más fluidas
 */
export const OrderWorkflow = ({ order, onOrderUpdate }) => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Determina el índice del paso actual basado en el estado del pedido
  const getCurrentStepIndex = () => {
    switch(order.status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1; // Indicar que está cancelado
      default: return 0;
    }
  };

  // Manejadores de eventos
  const handleStepAction = (actionId) => setActiveStep(actionId);

  // Versión mejorada del manejador de completado para evitar recargas innecesarias
  const handleFormComplete = () => {
    setIsUpdating(true);

    // Solo obtener los datos más recientes pero evitar recargar la UI
    // hasta que tengamos los datos actualizados
    dispatch(fetchOrderById(order.id)).then(() => {
      // Notificar solo por compatibilidad con componentes externos
      if (onOrderUpdate) {
        onOrderUpdate();
      }

      setIsUpdating(false);
      setActiveStep(null);
    }).catch(() => {
      setIsUpdating(false);
      setActiveStep(null);
    });
  };

  const handleFormCancel = () => setActiveStep(null);

  // Renderiza el formulario activo según la acción seleccionada
  const renderStepForm = () => {
    const formProps = {
      order,
      onComplete: handleFormComplete,
      onCancel: handleFormCancel
    };

    switch(activeStep) {
      case 'confirm-email': return <ConfirmationForm {...formProps} />;
      case 'update-status': return <ProcessingForm {...formProps} />;
      case 'ship-order': return <ShipmentForm {...formProps} />;
      case 'resend-shipping-email': return <ResendShippingForm {...formProps} />;
      case 'deliver-order': return <DeliveryForm {...formProps} />;
      case 'cancel-order': return <CancellationForm {...formProps} />; // Caso para cancelación
      default: return null;
    }
  };

  // Renderizar mensaje cuando el pedido está cancelado
  const renderCancelledState = () => (
    <div className="alert alert-secondary mt-3">
      <div className="d-flex align-items-center">
        <i className="bi bi-x-circle fs-4 me-3"></i>
        <div>
          <p className="mb-0 fw-medium">Este pedido ha sido cancelado</p>
          {order.statusHistory && order.statusHistory.find(h => h.to === 'cancelled') && (
            <p className="mb-0 small text-muted mt-1">
              {order.statusHistory.find(h => h.to === 'cancelled').notes || 'No se proporcionó motivo de cancelación'}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section>
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
        Flujo de Trabajo del Pedido
      </h6>

      {/* Si el pedido está cancelado, mostrar mensaje */}
      {order.status === 'cancelled' && renderCancelledState()}

      {/* Stepper que muestra el progreso con fondo gris */}
      <div className="rounded border bg-light p-3">
        <WorkflowStepper
          currentStep={getCurrentStepIndex()}
          order={order}
          onStepAction={handleStepAction}
        />
      </div>

      {/* Indicador de carga para actualizaciones */}
      {isUpdating && (
        <div className="d-flex justify-content-center my-4 py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Actualizando...</span>
          </div>
        </div>
      )}

      {/* Área para formularios activos sin fondo gris o historial de notificaciones */}
      {!isUpdating && activeStep ? (
        <div className="mt-4 p-0">
          {renderStepForm()}
        </div>
      ) : (
        !isUpdating && (
          <div className="mt-4">
            <h6 className="mb-3 text-secondary fw-normal">
              Historial de Notificaciones
            </h6>
            <NotificationHistory order={order} />
          </div>
        )
      )}
    </section>
  );
};