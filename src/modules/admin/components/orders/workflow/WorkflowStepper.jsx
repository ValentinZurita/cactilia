import React from 'react';
import { StepperItem } from './StepperItem';

/**
 * Stepper que muestra visualmente las etapas del pedido
 * @param {number} currentStep - Índice del paso actual
 * @param {Object} order - Datos del pedido
 * @param {Function} onStepAction - Función para ejecutar acciones en un paso
 */
export const WorkflowStepper = ({ currentStep, order, onStepAction }) => {
  // Solo permitir cancelación en estados específicos
  const allowCancellation = ['pending', 'processing', 'shipped'].includes(order.status);

  // Definición de pasos con sus acciones posibles
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
        },
        {
          id: 'cancel-order',
          label: 'Cancelar pedido',
          icon: 'x-circle',
          visible: order.status === 'pending',
          variant: 'outline-secondary'
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
        },
        {
          id: 'cancel-order',
          label: 'Cancelar pedido',
          icon: 'x-circle',
          visible: order.status === 'processing',
          variant: 'outline-secondary'
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
        },
        {
          id: 'cancel-order',
          label: 'Cancelar pedido',
          icon: 'x-circle',
          visible: order.status === 'shipped',
          variant: 'outline-secondary'
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

      {/* Botón de cancelación global (opcional, alternativa a los botones en cada paso) */}
      {allowCancellation && currentStep < 3 && order.status !== 'cancelled' && (
        <div className="ms-auto d-flex align-items-center ps-3 border-start">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onStepAction('cancel-order')}
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancelar pedido
          </button>
        </div>
      )}
    </div>
  );
};