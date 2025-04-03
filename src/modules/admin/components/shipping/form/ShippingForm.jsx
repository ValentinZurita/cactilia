import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import NavigationTabs from './components/NavigationTabs';
import BasicInfoSection from './sections/BasicInfoSection';
import PriceSection from './sections/PriceSection';
import DeliverySection from './sections/DeliverySection';

/**
 * Formulario para crear o editar reglas de envío
 */
export const ShippingForm = ({ initialData = {}, onSubmit = () => {}, onCancel }) => {
  const [activeSection, setActiveSection] = useState('info');
  
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
    register
  } = useForm({
    defaultValues: {
      ...initialData,
      activo: initialData?.activo !== undefined ? initialData.activo : true
    }
  });
  
  // Valores actuales del formulario
  const zipCodes = watch('zipcodes') || [];
  const zoneName = watch('name') || '';
  const shippingTypes = watch('shippingTypes') || [];
  
  // Manejar el cambio de sección
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  
  // Manejar el envío del formulario
  const submitForm = (data) => {
    // Validaciones
    const validationErrors = [];
    
    // Validar que haya al menos un código postal
    if (!data.zipcodes || data.zipcodes.length === 0) {
      validationErrors.push('Debe agregar al menos un código postal o zona de cobertura');
    }
    
    // Validar que tenga un nombre
    if (!data.name || data.name.trim() === '') {
      validationErrors.push('Debe especificar un nombre para la zona');
    }
    
    // Validar que tenga al menos un método de envío
    if (!data.shippingTypes || data.shippingTypes.length === 0) {
      validationErrors.push('Debe agregar al menos un método de envío');
    }
    
    // Si hay errores, mostrarlos y cambiar a la sección correspondiente
    if (validationErrors.length > 0) {
      // Mostrar el primer error
      alert(validationErrors[0]);
      
      // Cambiar a la sección correspondiente según el error
      if (validationErrors[0].includes('código postal')) {
        setActiveSection('info');
      } else if (validationErrors[0].includes('nombre')) {
        setActiveSection('info');
      } else if (validationErrors[0].includes('método de envío')) {
        setActiveSection('delivery');
      }
      
      return;
    }
    
    // Asegurarnos de que el objeto tenga la propiedad activo
    const formData = {
      ...data,
      activo: data.status !== undefined ? data.status : true
    };
    
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    } else {
      console.error('Error: onSubmit handler is not a function');
      alert('Error al guardar la regla. Por favor, inténtalo de nuevo más tarde.');
    }
  };
  
  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit(submitForm)}>
        <NavigationTabs 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
        
        <div className="tab-content p-3">
          {activeSection === 'info' && (
            <BasicInfoSection 
              control={control} 
              register={register}
              errors={errors} 
              zipCodes={zipCodes} 
              setZipCodes={(codes) => setValue('zipcodes', codes)} 
              setValue={setValue}
              watch={watch}
            />
          )}
          
          {activeSection === 'price' && (
            <PriceSection 
              control={control} 
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          )}
          
          {activeSection === 'delivery' && (
            <DeliverySection 
              control={control} 
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          )}
        </div>
        
        <div className="d-flex justify-content-end gap-2 p-3 border-top">
          <button 
            type="button" 
            className="btn btn-outline-secondary px-3" 
            onClick={typeof onCancel === 'function' ? onCancel : () => window.history.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            className="btn btn-dark px-3" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              'Guardar Regla'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};