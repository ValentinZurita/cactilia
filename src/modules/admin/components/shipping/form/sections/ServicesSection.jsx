import React from 'react';
import { DeliveryServicesSelector } from '../components';

/**
 * Componente para la sección de servicios de mensajería
 */
export const ServicesSection = ({ control, services, loading }) => {
  return (
    <div className="shipping-services">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Servicios de Mensajería</h6>

      <DeliveryServicesSelector
        control={control}
        services={services}
        loading={loading}
      />
    </div>
  );
}; 