import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import NavigationTabs from './components/NavigationTabs';
import BasicInfoSection from './sections/BasicInfoSection';
import PriceSection from './sections/PriceSection';
import DeliverySection from './sections/DeliverySection';

/**
 * Formulario para crear o editar reglas de envío
 */
export const ShippingForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [activeSection, setActiveSection] = useState('info');
  
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
    register
  } = useForm({
    defaultValues: initialData
  });
  
  // Valores actuales del formulario
  const zipCodes = watch('zipcodes') || [];
  
  // Manejar el cambio de sección
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  
  // Manejar el envío del formulario
  const submitForm = (data) => {
    // Validar que haya al menos un código postal
    if (!data.zipcodes || data.zipcodes.length === 0) {
      alert('Debe agregar al menos un código postal o zona de cobertura');
      return;
    }
    onSubmit(data);
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
            />
          )}
          
          {activeSection === 'delivery' && (
            <DeliverySection 
              control={control} 
              errors={errors}
              watch={watch}
            />
          )}
        </div>
        
        <div className="d-flex justify-content-end gap-2 p-3 bg-light">
          <button 
            type="button" 
            className="btn btn-outline-secondary px-3" 
            onClick={onCancel}
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