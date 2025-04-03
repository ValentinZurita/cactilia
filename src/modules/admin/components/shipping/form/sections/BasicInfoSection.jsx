import React from 'react';
import { ZipCodeSection, ZoneField, StatusField, ShippingConfigSection } from '../components';

/**
 * Componente que contiene toda la sección de información básica
 */
export const BasicInfoSection = ({ control, watch, setValue, errors, zipCodes, setZipCodes }) => {
  return (
    <div className="basic-info">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Información General</h6>

      <div className="row g-4 mb-4">
        {/* Códigos Postales */}
        <div className="col-12 mb-2">
          <ZipCodeSection 
            control={control}
            zipCodes={zipCodes}
            setZipCodes={setZipCodes}
            setValue={setValue}
            errors={errors}
          />
        </div>

        <div className="col-12">
          <hr className="text-muted opacity-25 my-1" />
        </div>

        {/* Zona */}
        <div className="col-12">
          <ZoneField 
            control={control}
            errors={errors}
          />
        </div>

        <div className="col-12">
          <hr className="text-muted opacity-25 my-1" />
        </div>

        {/* Envío Gratis */}
        <div className="col-12">
          <ShippingConfigSection 
            control={control}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        </div>

        <div className="col-12">
          <hr className="text-muted opacity-25 my-1" />
        </div>

        {/* Estado */}
        <div className="col-12">
          <StatusField 
            control={control}
          />
        </div>
      </div>
    </div>
  );
}; 