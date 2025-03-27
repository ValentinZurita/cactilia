import React, { useState } from 'react';
import { WorkflowStepper } from './WorkflowStepper';
import { NotificationHistory } from './NotificationHistory';
import { ProcessingForm } from '../steps/ProcessingForm';
import { ShipmentForm } from '../steps/ShipmentForm';
import { ResendShippingForm } from '../steps/ResendShippingForm';
import { DeliveryForm } from '../steps/DeliveryForm';
import { ConfirmationForm } from '../steps/ConfirmationForm';

/**
 * Flujo de trabajo para procesar pedidos a través de sus diferentes etapas
 * Permite visualizar el progreso y realizar acciones en cada paso
 */
export const OrderWorkflow = ({ order, onOrderUpdate }) => {
  const [activeStep, setActiveStep] = useState(null);

  // Determina el índice del paso actual basado en el estado del pedido
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

  // Manejadores de eventos
  const handleStepAction = (actionId) => setActiveStep(actionId);
  const handleFormComplete = () => {
    onOrderUpdate();
    setActiveStep(null);
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
      default: return null;
    }
  };

  return (
    <section>
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
        Flujo de Trabajo del Pedido
      </h6>

      {/* Stepper que muestra el progreso */}
      <WorkflowStepper
        currentStep={getCurrentStepIndex()}
        order={order}
        onStepAction={handleStepAction}
      />

      {/* Área para formularios activos o historial de notificaciones */}
      {activeStep ? (
        <div className="mt-4 p-3 bg-light rounded border">
          {renderStepForm()}
        </div>
      ) : (
        <div className="mt-4">
          <h6 className="mb-3 text-secondary fw-normal">
            Historial de Notificaciones
          </h6>
          <NotificationHistory order={order} />
        </div>
      )}
    </section>
  );
};