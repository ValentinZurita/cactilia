import React from 'react';
import PropTypes from 'prop-types';
import { useShippingForm } from './hooks/useShippingForm';
import {
  NavigationTabs,
  CoverageSection,
  RulesSection,
  MethodsSection,
  ZipCodeSelector
} from './components/form';
import { FORM_STEPS } from './constants';

/**
 * Componente principal para el formulario de reglas de envío
 * Maneja la creación y edición de reglas
 * @param {Object} initialData - Datos iniciales para edición
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} onCancel - Función a ejecutar al cancelar
 */
const ShippingForm = ({
  initialData = null,
  onSubmit = () => {},
  onCancel = () => {}
}) => {
  // Usar el hook para manejar el formulario
  const {
    currentStep,
    isSubmitting,
    submitError,
    errors,
    formValues,
    control,
    watch,
    setValue,
    handleSubmit,
    goToStep,
    nextStep,
    prevStep,
    resetForm
  } = useShippingForm(initialData, onSubmit);
  
  // Determinar si es edición o creación
  const isEditing = Boolean(initialData?.id);
  
  // Manejar cambio de pestaña
  const handleTabClick = (tabIndex) => {
    goToStep(tabIndex);
  };
  
  // Renderizar sección actual según el paso
  const renderCurrentSection = () => {
    switch (currentStep) {
      case FORM_STEPS.BASIC_INFO:
        return (
          <>
            <CoverageSection
              control={control}
              errors={errors}
              watch={watch}
            />
            <ZipCodeSelector
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          </>
        );
      
      case FORM_STEPS.RULES:
        return (
          <RulesSection
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case FORM_STEPS.METHODS:
        return (
          <MethodsSection
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="shipping-form-container">
      <form onSubmit={handleSubmit} className="shipping-form">
        {/* Navegación entre secciones */}
        <NavigationTabs
          currentStep={currentStep}
          onTabClick={handleTabClick}
        />
        
        {/* Mostrar error de envío */}
        {submitError && (
          <div className="alert alert-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {submitError}
          </div>
        )}
        
        {/* Sección actual */}
        <div className="form-section">
          {renderCurrentSection()}
        </div>
        
        {/* Botones de navegación y acciones */}
        <div className="d-flex justify-content-between mt-4 pt-4 border-top">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Anterior
              </button>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            {currentStep < Object.values(FORM_STEPS).length - 1 ? (
              <button
                type="button"
                className="btn btn-dark"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Siguiente
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2"></i>
                    {isEditing ? 'Actualizar Regla' : 'Crear Regla'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

ShippingForm.propTypes = {
  /** Datos iniciales para edición */
  initialData: PropTypes.object,
  /** Función a ejecutar al enviar el formulario */
  onSubmit: PropTypes.func,
  /** Función a ejecutar al cancelar */
  onCancel: PropTypes.func
};

export default ShippingForm; 