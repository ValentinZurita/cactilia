import React from 'react';
import { StepperItem } from './StepperItem';

/**
 * Versión flexible del stepper que permite acciones en cualquier etapa
 *
 * @param {Object} props
 * @param {number} props.currentStep - Índice del paso actual (0-3)
 * @param {Object} props.order - Datos del pedido
 * @param {Function} props.onStepAction - Función para manejar acciones en los pasos
 */
export const WorkflowStepper = ({ currentStep, order, onStepAction }) => {
  // Definir los pasos y sus acciones disponibles según el estado actual
  const steps = [
    {
      id: 'confirm',
      title: 'Confirmación',
      description: 'Pedido recibido',
      icon: 'check-circle',
      status: currentStep > 0 ? 'completed' : (currentStep === 0 ? 'current' : 'upcoming'),
      actions: [
        {
          id: 'confirm-email',
          label: 'Reenviar confirmación',
          icon: 'envelope',
          visible: true, // Siempre disponible
          primary: currentStep === 0
        }
      ]
    },
    {
      id: 'process',
      title: 'Procesamiento',
      description: 'Preparando pedido',
      icon: 'gear',
      status: currentStep > 1 ? 'completed' : (currentStep === 1 ? 'current' : 'upcoming'),
      actions: [
        {
          id: 'update-status',
          label: order.status === 'pending' ? 'Marcar como procesando' :
            (order.status === 'processing' ? 'Actualizar estado' : null),
          icon: 'gear',
          visible: ['pending', 'processing'].includes(order.status),
          primary: currentStep === 1
        }
      ]
    },
    {
      id: 'ship',
      title: 'Envío',
      description: 'Pedido en camino',
      icon: 'truck',
      status: currentStep > 2 ? 'completed' : (currentStep === 2 ? 'current' : 'upcoming'),
      actions: [
        {
          id: 'ship-order',
          label: order.status === 'processing' ? 'Marcar como enviado' :
            (order.status === 'shipped' ? 'Actualizar envío' : null),
          icon: 'truck',
          visible: ['processing', 'shipped'].includes(order.status),
          primary: currentStep === 2
        },
        {
          id: 'resend-shipping-email',
          label: 'Reenviar notificación',
          icon: 'envelope',
          visible: order.status === 'shipped' || order.status === 'delivered',
          primary: false
        }
      ]
    },
    {
      id: 'deliver',
      title: 'Entrega',
      description: 'Pedido entregado',
      icon: 'box-seam',
      status: currentStep > 3 ? 'completed' : (currentStep === 3 ? 'current' : 'upcoming'),
      actions: [
        {
          id: 'deliver-order',
          label: order.status === 'shipped' ? 'Marcar como entregado' : null,
          icon: 'check-circle',
          visible: order.status === 'shipped',
          primary: currentStep === 3
        }
      ]
    }
  ];

  return (
    <div className="workflow-stepper mb-4">
      <div className="d-flex flex-nowrap overflow-auto pb-3">
        {steps.map((step, index) => (
          <StepperItem
            key={step.id}
            step={step}
            index={index}
            isLastStep={index === steps.length - 1}
            onAction={onStepAction}
          />
        ))}
      </div>
    </div>
  );
};