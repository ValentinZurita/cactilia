import React from 'react';
import { useShippingServices, useShippingForm } from '../hooks';
import { BasicInfoSection, ServicesSection, AdvancedSection } from './sections';
import { NavigationTabs } from './components';

/**
 * Formulario para crear o editar reglas de envío.
 * Renovado para seguir el estilo minimalista del módulo Orders
 */
export const ShippingForm = ({ rule, isEdit = false, onSave, onCancel, onComplete }) => {
  // Obtener servicios de envío disponibles
  const { services, loading: loadingServices } = useShippingServices();
  
  // Utilizar hook personalizado para el formulario
  const {
    processing,
    error,
    activeSection,
    zipCodes,
    setActiveSection,
    setZipCodes,
    setError,
    control,
    handleSubmit,
    setValue,
    watch,
    errors,
    watchVariableShipping,
    watchRestrictedProducts,
    watchEnvioGratis,
    watchZipCodes
  } = useShippingForm(rule, isEdit, onSave, onComplete);

  return (
    <div className="shipping-form">
      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger py-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Tabs de navegación */}
      <NavigationTabs
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <form onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            {/* Sección de información básica */}
            {activeSection === 'basic' && (
              <BasicInfoSection
                control={control}
                watch={watch}
                setValue={setValue}
                errors={errors}
                zipCodes={zipCodes}
                setZipCodes={setZipCodes}
              />
            )}

            {/* Sección de servicios de mensajería */}
            {activeSection === 'services' && (
              <ServicesSection
                control={control}
                services={services}
                loading={loadingServices}
              />
            )}

            {/* Sección de configuración avanzada */}
            {activeSection === 'advanced' && (
              <AdvancedSection
                control={control}
                errors={errors}
                watchVariableShipping={watchVariableShipping}
                watchRestrictedProducts={watchRestrictedProducts}
              />
            )}

            {/* Botones de acción */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-3"
                onClick={onCancel}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-outline-dark rounded-3"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>Guardar Regla</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};