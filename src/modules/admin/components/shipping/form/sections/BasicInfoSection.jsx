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
    <div>
      {/* Sección de Identificación en una Card - SIN TÍTULO */}
      <div className="card mb-4">
        <div className="card-body p-4">
          <div className="mb-3">
            <ZoneField 
              control={control}
              errors={errors}
            />
          </div>
          <div className="mb-3">
            <StatusField 
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          </div>
        </div>
      </div>
      
      {/* Sección de Cobertura Geográfica en otra Card */}
      <div className="card mb-4">
        <div className="card-body p-4">
          <h6 className="card-title mb-4">Cobertura geográfica</h6>
          <div className="mb-4">
            <ShippingConfigSection />
          </div>
          <ZipCodeSection 
            zipCodes={zipCodes}
            setZipCodes={setZipCodes}
            setValue={setValue}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
