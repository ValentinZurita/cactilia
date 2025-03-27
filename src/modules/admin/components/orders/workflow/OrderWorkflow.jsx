import React, { useState } from 'react';
import { WorkflowStepper } from './WorkflowStepper';
import { NotificationHistory } from './NotificationHistory';
import { ProcessingForm } from '../steps/ProcessingForm.jsx'
import { ShipmentForm } from '../steps/ShipmentForm.jsx'
import { ResendShippingForm } from '../steps/ResendShippingForm.jsx'
import { DeliveryForm } from '../steps/DeliveryForm.jsx'
import { ConfirmationForm } from '../steps/ConfirmationForm.jsx'


/**
 * Componente principal del flujo de trabajo de pedidos con estilos Bootstrap
 * y soporte para funciones en cualquier etapa del proceso
 *
 * @param {Object} props
 * @param {Object} props.order - Datos del pedido
 * @param {Function} props.onOrderUpdate - Función para actualizar el pedido
 */
export const OrderWorkflow = ({ order, onOrderUpdate }) => {
  const [activeStep, setActiveStep] = useState(null);

  const getCurrentStepIndex = () => {
    switch(order.status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const handleStepAction = (actionId) => {
    setActiveStep(actionId);
  };

  const handleFormComplete = () => {
    onOrderUpdate();
    setActiveStep(null);
  };

  const handleFormCancel = () => {
    setActiveStep(null);
  };

  const renderStepForm = () => {
    switch(activeStep) {
      case 'confirm-email':
        return (
          <ConfirmationForm
            order={order}
            onComplete={handleFormComplete}
            onCancel={handleFormCancel}
          />
        );
      case 'update-status':
        return (
          <ProcessingForm
            order={order}
            onComplete={handleFormComplete}
            onCancel={handleFormCancel}
          />
        );
      case 'ship-order':
        return (
          <ShipmentForm
            order={order}
            onComplete={handleFormComplete}
            onCancel={handleFormCancel}
          />
        );
      case 'resend-shipping-email':
        return (
          <ResendShippingForm
            order={order}
            onComplete={handleFormComplete}
            onCancel={handleFormCancel}
          />
        );
      case 'deliver-order':
        return (
          <DeliveryForm
            order={order}
            onComplete={handleFormComplete}
            onCancel={handleFormCancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="order-workflow">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
        Flujo de Trabajo del Pedido
      </h6>

      <WorkflowStepper
        currentStep={getCurrentStepIndex()}
        order={order}
        onStepAction={handleStepAction}
      />

      {activeStep && (
        <div className="mt-4 p-4 bg-light rounded-3">
          {renderStepForm()}
        </div>
      )}

      {!activeStep && (
        <div className="mt-4">
          <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
            Historial de Notificaciones
          </h6>
          <NotificationHistory order={order} />
        </div>
      )}
    </section>
  );
};