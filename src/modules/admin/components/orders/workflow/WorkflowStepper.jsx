import React from 'react';
import { StepperItem } from './StepperItem';

/**
 * Stepper minimalista para visualizar el flujo de trabajo
 */
export const WorkflowStepper = ({ currentStep, order, onStepAction }) => {
  // Definición de pasos simplificada
  const steps = [
    {
      id: 'confirm',
      title: 'Confirmación',
      description: 'Pedido recibido',
      icon: 'check-circle',
      status: currentStep >= 0 ? (currentStep > 0 ? 'completed' : 'current') : 'upcoming',
      actions: [
        {
          id: 'confirm-email',
          label: 'Reenviar confirmación',
          icon: 'envelope',
          visible: true
        }
      ]
    },
    {
      id: 'process',
      title: 'Procesamiento',
      description: 'Preparando pedido',
      icon: 'gear',
      status: currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'current') : 'upcoming',
      actions: [
        {
          id: 'update-status',
          label: order.status === 'pending' ? 'Procesar pedido' :
            (order.status === 'processing' ? 'Actualizar estado' : null),
          icon: 'gear',
          visible: ['pending', 'processing'].includes(order.status)
        }
      ]
    },
    {
      id: 'ship',
      title: 'Envío',
      description: 'Pedido en camino',
      icon: 'truck',
      status: currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'current') : 'upcoming',
      actions: [
        {
          id: 'ship-order',
          label: order.status === 'processing' ? 'Marcar como enviado' :
            (order.status === 'shipped' ? 'Actualizar envío' : null),
          icon: 'truck',
          visible: ['processing', 'shipped'].includes(order.status)
        },
        {
          id: 'resend-shipping-email',
          label: 'Reenviar notificación',
          icon: 'envelope',
          visible: order.status === 'shipped' || order.status === 'delivered'
        }
      ]
    },
    {
      id: 'deliver',
      title: 'Entrega',
      description: 'Pedido entregado',
      icon: 'box-seam',
      status: currentStep >= 3 ? (currentStep > 3 ? 'completed' : 'current') : 'upcoming',
      actions: [
        {
          id: 'deliver-order',
          label: order.status === 'shipped' ? 'Confirmar entrega' : null,
          icon: 'check-circle',
          visible: order.status === 'shipped'
        }
      ]
    }
  ];

  return (
    <div className="mb-4 bg-light p-3 rounded border">
      <div className="d-flex flex-nowrap overflow-auto py-2">
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