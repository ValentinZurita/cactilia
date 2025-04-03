import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para la configuración de tiempos de entrega y opciones de envío
 */
const DeliverySection = ({ control, errors, watch }) => {
  // Obtener los valores actuales
  const minDeliveryTime = watch('minDeliveryTime') || 1;
  const freeShippingThreshold = watch('freeShippingThreshold');
  
  return (
    <div className="py-2">
      <h6 className="text-secondary mb-3">Tiempos de entrega</h6>
      
      <div className="card border-0 bg-light mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-secondary small mb-1">Tiempo mínimo</label>
              <Controller
                name="minDeliveryTime"
                control={control}
                defaultValue={1}
                rules={{
                  required: 'Este campo es obligatorio',
                  min: {
                    value: 1,
                    message: 'Debe ser al menos 1 día'
                  }
                }}
                render={({ field }) => (
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      className={`form-control ${errors?.minDeliveryTime ? 'is-invalid' : ''}`}
                      min="1"
                      {...field}
                    />
                    <span className="input-group-text">días</span>
                  </div>
                )}
              />
              {errors?.minDeliveryTime && (
                <div className="invalid-feedback d-block small">
                  {errors.minDeliveryTime.message}
                </div>
              )}
            </div>
            
            <div className="col-md-6">
              <label className="form-label text-secondary small mb-1">Tiempo máximo</label>
              <Controller
                name="maxDeliveryTime"
                control={control}
                defaultValue={3}
                rules={{
                  required: 'Este campo es obligatorio',
                  min: {
                    value: 1,
                    message: 'Debe ser al menos 1 día'
                  },
                  validate: value => {
                    return value >= minDeliveryTime || 'Debe ser mayor o igual al tiempo mínimo';
                  }
                }}
                render={({ field }) => (
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      className={`form-control ${errors?.maxDeliveryTime ? 'is-invalid' : ''}`}
                      min={minDeliveryTime}
                      {...field}
                    />
                    <span className="input-group-text">días</span>
                  </div>
                )}
              />
              {errors?.maxDeliveryTime && (
                <div className="invalid-feedback d-block small">
                  {errors.maxDeliveryTime.message}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-text small mt-2">
            Este rango se mostrará a los clientes durante el proceso de compra.
          </div>
        </div>
      </div>
      
      <h6 className="text-secondary mb-3">Servicios de mensajería</h6>
      
      <div className="card border-0 bg-light">
        <div className="card-body">
          <Controller
            name="carriers"
            control={control}
            defaultValue={[]}
            render={({ field: { value, onChange } }) => (
              <div className="row g-2">
                {['DHL', 'Estafeta', 'FedEx', 'Redpack', 'Correos de México'].map(carrier => (
                  <div className="col-md-4" key={carrier}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`carrier-${carrier}`}
                        checked={value.includes(carrier)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...value, carrier]
                            : value.filter(c => c !== carrier);
                          onChange(newValue);
                        }}
                      />
                      <label className="form-check-label small" htmlFor={`carrier-${carrier}`}>
                        {carrier}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
          
          <div className="form-text small mt-2">
            Seleccione los servicios de mensajería disponibles para esta zona.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySection; 