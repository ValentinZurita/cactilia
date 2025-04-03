import React from 'react';
import { ZoneField, StatusField, ShippingConfigSection } from '../components';

/**
 * Componente que contiene toda la sección de información básica
 */
export const BasicInfoSection = ({ zipCodes, setZipCodes, control, watch, setValue, errors }) => {
  return (
    <div className="basic-info">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Información General</h6>

      <div className="row g-4 mb-4">
        {/* Configuración de Envío (incluye ZipCodeSection) */}
        <div className="col-12">
          <ShippingConfigSection 
            zipCodes={zipCodes}
            setZipCodes={setZipCodes}
            control={control}
            watch={watch}
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

        {/* Estado */}
        <div className="col-12">
          <StatusField 
            control={control}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
};
