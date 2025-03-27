import { StepperItem } from './StepperItem';

/**
 * Stepper que muestra visualmente las etapas del pedido
 * con timeline mejorado y líneas continuas
 */
export const WorkflowStepper = ({ currentStep, order, onStepAction }) => {
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

  // Solo permitir cancelación en estados específicos
  const allowCancellation = ['pending', 'processing', 'shipped'].includes(order.status);

  return (
    // Contenedor principal - ajustado para evitar cortes
    <div className="d-flex flex-column">
      {/* Línea de timeline continua */}
      <div className="position-relative mb-4">
        {/* Línea trasera continua */}
        <div className="position-absolute bg-light"
             style={{
               height: '2px',
               top: '20px',
               left: '10%',
               width: '80%',
               zIndex: 0
             }}></div>

        {/* Contenedor de steps con posicionamiento correcto */}
        <div className="d-flex justify-content-between position-relative">
          {steps.map((step, index) => (
            <StepperItem
              key={step.id}
              step={step}
              index={index}
              isLastStep={index === steps.length - 1}
              onAction={onStepAction}
              isActive={index <= currentStep}
              totalSteps={steps.length}
            />
          ))}
        </div>
      </div>

      {/* Botón de cancelación global (opcional) */}
      {allowCancellation && currentStep < 3 && order.status !== 'cancelled' && (
        <div className="d-flex justify-content-end mt-2">
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