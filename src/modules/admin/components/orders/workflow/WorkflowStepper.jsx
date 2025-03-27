import React, { useRef, useEffect, useState } from 'react';
import { StepperItem } from './StepperItem';

/**
 * Stepper que muestra visualmente las etapas del pedido
 * - Timeline vertical completamente continuo sin interrupciones
 * - Igual de hermoso que la versión horizontal
 */
export const WorkflowStepper = ({ currentStep, order, onStepAction }) => {
  // Referencia al contenedor del timeline vertical
  const verticalTimelineRef = useRef(null);

  // Estado para la altura del timeline vertical
  const [verticalHeight, setVerticalHeight] = useState(0);

  // Calcular la altura del contenedor vertical al montar y al cambiar tamaño
  useEffect(() => {
    const calculateHeight = () => {
      if (verticalTimelineRef.current) {
        // Añadimos un pequeño margen extra para asegurar que la línea sea completa
        setVerticalHeight(verticalTimelineRef.current.scrollHeight + 20);
      }
    };

    // Calcular altura inicial después de renderizar
    setTimeout(calculateHeight, 100);

    // Actualizar en cambios de tamaño
    window.addEventListener('resize', calculateHeight);

    // Limpiar listener
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

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
          variant: 'outline-danger'
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
          variant: 'outline-danger'
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
          variant: 'outline-danger'
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

  // Calcular la altura de progreso en porcentaje
  const progressPercentage = Math.min(100, ((currentStep + 1) / steps.length) * 100);

  return (
    <>
      {/* Desktop/Tablet Version - Horizontal */}
      <div className="d-none d-md-block">
        <div className="position-relative mb-4">
          {/* Línea trasera continua */}
          <div className="position-absolute bg-light"
               style={{
                 height: '2px',
                 top: '20px',
                 left: '10%',
                 width: '80%',
                 zIndex: 0
               }}>
          </div>

          {/* Contenedor de steps con posicionamiento */}
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
                orientation="horizontal"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Version - Vertical con línea continua perfecta */}
      <div className="d-md-none">
        <div className="position-relative" style={{ minHeight: '400px' }}>
          {/* Contenedor con seguimiento de altura */}
          <div ref={verticalTimelineRef} className="d-flex flex-column position-relative">
            {/* Línea de fondo que recorre todo el timeline (siempre visible) */}
            <div className="position-absolute bg-light"
                 style={{
                   width: '2px',
                   top: '0',
                   height: `${verticalHeight}px`,
                   left: '19px',
                   zIndex: 1
                 }}>
            </div>

            {/* Línea de progreso (solo la parte completada) */}
            <div className="position-absolute bg-dark"
                 style={{
                   width: '2px',
                   top: '0',
                   height: `${progressPercentage}%`,
                   left: '19px',
                   zIndex: 2,
                   maxHeight: `${verticalHeight}px`
                 }}>
            </div>

            {/* Steps verticales */}
            {steps.map((step, index) => (
              <StepperItem
                key={step.id}
                step={step}
                index={index}
                isLastStep={index === steps.length - 1}
                onAction={onStepAction}
                isActive={index <= currentStep}
                totalSteps={steps.length}
                orientation="vertical"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};