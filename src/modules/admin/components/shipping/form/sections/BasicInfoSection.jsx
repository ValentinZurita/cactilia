import React from 'react';
import ZoneField from '../components/ZoneField';
import StatusField from '../components/StatusField';
import ShippingConfigSection from '../components/ShippingConfigSection';
import ZipCodeSection from '../components/ZipCodeSection';

/**
 * Componente que contiene toda la sección de información básica
 */
const BasicInfoSection = ({ zipCodes, setZipCodes, control, errors, setValue, watch, register }) => {
  return (
    <div className="py-3">
      {/* Información de jerarquía */}
      <ShippingConfigSection />
      
      {/* Configuración de Cobertura */}
      <h6 className="text-dark mb-4">Cobertura geográfica</h6>
      <ZipCodeSection 
        zipCodes={zipCodes}
        setZipCodes={setZipCodes}
        setValue={setValue}
      />
      
      {/* Información de la Zona */}
      <h6 className="text-dark mb-4">Identificación de la regla</h6>
      <div className="d-flex align-items-start gap-4 mb-4">
        <div className="flex-grow-1">
          <ZoneField 
            control={control}
            errors={errors}
          />
        </div>
        <div>
          <StatusField 
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
