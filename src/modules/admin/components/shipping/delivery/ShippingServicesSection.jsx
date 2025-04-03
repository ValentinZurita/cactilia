import React, { useState } from 'react';
import { ShippingServiceForm } from './ShippingServiceForm';
import { DeliveryServicesSelector } from '../form/DeliveryServicesSelector.jsx'

/**
 * Componente para la sección de servicios de envío de una regla.
 * Permite seleccionar servicios existentes y crear nuevos.
 */
export const ShippingServicesSection = ({
                                          control,
                                          services,
                                          loadingServices,
                                          refreshServices,
                                          createService
                                        }) => {
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  // Manejar creación de nuevo servicio
  const handleCreateService = async (serviceData) => {
    setServiceError(null);

    try {
      const result = await createService(serviceData);

      if (result.ok) {
        await refreshServices();
        setShowNewServiceForm(false);
        return { ok: true };
      } else {
        setServiceError(result.error || 'Error al crear el servicio');
        return result;
      }
    } catch (error) {
      console.error('Error al crear servicio:', error);
      setServiceError(error.message || 'Error inesperado al crear el servicio');
      return { ok: false, error: error.message };
    }
  };

  return (
    <div className="shipping-services">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
        Servicios de Mensajería
      </h6>

      {/* Mensaje de error */}
      {serviceError && (
        <div className="alert alert-danger py-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {serviceError}
        </div>
      )}

      {/* Mensaje informativo */}
      <div className="alert alert-info py-2 mb-3">
        <div className="d-flex align-items-start">
          <i className="bi bi-info-circle text-primary me-2 mt-1"></i>
          <div className="small">
            <p className="mb-1">Selecciona los servicios de mensajería disponibles para esta zona.</p>
            <p className="mb-0">Puedes personalizar el precio y tiempo de entrega para cada servicio.</p>
          </div>
        </div>
      </div>

      {/* Botón para añadir nuevo servicio */}
      <div className="mb-4">
        {!showNewServiceForm ? (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setShowNewServiceForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Crear Nuevo Servicio
          </button>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-medium">Nuevo Servicio de Envío</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowNewServiceForm(false)}
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="card-body">
              <ShippingServiceForm
                onSave={handleCreateService}
                onCancel={() => setShowNewServiceForm(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Selector de servicios existentes */}
      <DeliveryServicesSelector
        control={control}
        services={services}
        loading={loadingServices}
      />

      {/* Sección de ayuda */}
      {!showNewServiceForm && (
        <div className="mt-4 pt-3 border-top">
          <div className="alert alert-secondary py-2">
            <div className="d-flex align-items-start">
              <i className="bi bi-lightbulb text-secondary me-2 mt-1"></i>
              <div className="small">
                <p className="mb-1"><strong>Consejo:</strong> Si necesitas un servicio que no aparece en la lista, puedes crear uno nuevo con el botón "Crear Nuevo Servicio".</p>
                <p className="mb-0">Los servicios que crees estarán disponibles para todas las reglas de envío.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};