import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

// Importaciones consolidadas desde index.js
import { 
  BasicInfoSection,
  ServicesSection,
  AdvancedSection
} from './sections';

// Importación de componentes
import { NavigationTabs } from './components';

// Importaciones de hooks
import { useShippingForm, useShippingServices } from '../hooks';

/**
 * Formulario para crear o editar reglas de envío.
 * Renovado para seguir el estilo minimalista del módulo Orders
 */
export const ShippingForm = ({ rule, isEdit = false, onSave, onCancel }) => {
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
    watchEnvioGratis
  } = useShippingForm(rule, isEdit, onSave, () => {
    // Mostrar mensaje de éxito utilizando el sistema nativo de alertas
    const successMessage = `Regla de envío ${isEdit ? 'actualizada' : 'creada'} correctamente`;
    // Aquí podrías usar un toaster de Bootstrap si tienes alguno configurado
    // Por ahora, simplemente manejamos el éxito sin mostrar un mensaje toast
    onCancel();
  });

  // Configurar opciones de mensajería al cargar los servicios
  useEffect(() => {
    if (services.length > 0 && !isEdit) {
      // Si es una nueva regla, seleccionar por defecto todas las opciones
      setValue('opciones_mensajeria', services.map(service => service.id));
    }
  }, [services, isEdit, setValue]);

  // Cambio de sección activa
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Definir items para los pasos de navegación
  const navItems = [
    {
      title: 'Información Básica',
      key: 'basic',
      icon: 'tag'
    },
    {
      title: 'Servicios',
      key: 'services',
      icon: 'truck'
    },
    {
      title: 'Avanzado',
      key: 'advanced',
      icon: 'gear'
    }
  ];

  // Renderizar según la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <BasicInfoSection
            zipCodes={zipCodes}
            setZipCodes={setZipCodes}
            control={control}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        );
      case 'services':
        return (
          <ServicesSection
            control={control}
            watch={watch}
            errors={errors}
            services={services}
            loading={loadingServices}
          />
        );
      case 'advanced':
        return (
          <AdvancedSection
            control={control}
            watch={watch}
            setValue={setValue}
            errors={errors}
            variableShipping={watchVariableShipping}
            watchRestrictedProducts={watchRestrictedProducts}
          />
        );
      default:
        return <div>Sección no encontrada</div>;
    }
  };

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

      {/* Formulario principal */}
      <form onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            {/* Sección activa del formulario */}
            {processing ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Procesando...</span>
                </div>
                <p className="mt-2 text-secondary">Procesando la información...</p>
              </div>
            ) : (
              renderActiveSection()
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