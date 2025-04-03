import React from 'react';
import { Controller } from 'react-hook-form';
import { MultipleZipCodeSelector } from '../zips/MultipleZipCodeSelector.jsx'

/**
 * Componente para la sección de información básica de una regla de envío.
 */
export const ShippingBasicInfo = ({
                                    control,
                                    errors,
                                    setValue,
                                    watch,
                                    hasZipConflicts,
                                    conflictingZips
                                  }) => {
  const watchEnvioGratis = watch('envio_gratis');
  const watchIsStateRule = watch('es_regla_estado');

  return (
    <div className="basic-info">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Información General</h6>

      <div className="row g-3 mb-4">
        {/* Nombre de la Zona */}
        <div className="col-md-6">
          <label htmlFor="zona" className="form-label text-secondary small">
            Nombre de la Zona
          </label>
          <Controller
            name="zona"
            control={control}
            rules={{
              required: 'El nombre de la zona es obligatorio'
            }}
            render={({ field }) => (
              <input
                type="text"
                id="zona"
                className={`form-control ${errors.zona ? 'is-invalid' : ''}`}
                placeholder="Ej: Centro Puebla"
                {...field}
              />
            )}
          />
          {errors.zona && (
            <div className="invalid-feedback">{errors.zona.message}</div>
          )}
        </div>

        {/* Tipo de Regla (Estado o Códigos) */}
        <div className="col-md-6">
          <label className="form-label text-secondary small">Tipo de Regla</label>
          <div className="card border-0 rounded-4 bg-light">
            <div className="card-body p-3">
              <Controller
                name="es_regla_estado"
                control={control}
                render={({ field }) => (
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      id="es_regla_estado"
                      className="form-check-input"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <label className="form-check-label ms-2" htmlFor="es_regla_estado">
                      <span className="fw-medium">Regla por Estado</span>
                      <small className="text-muted d-block">
                        Aplicar a todo un estado en lugar de códigos postales específicos
                      </small>
                    </label>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Estado (solo si es regla por estado) */}
        {watchIsStateRule && (
          <div className="col-md-6">
            <label htmlFor="estado" className="form-label text-secondary small">Estado</label>
            <Controller
              name="estado"
              control={control}
              rules={{
                required: watchIsStateRule ? 'Debes seleccionar un estado' : false
              }}
              render={({ field }) => (
                <select
                  id="estado"
                  className={`form-select ${errors.estado ? 'is-invalid' : ''}`}
                  {...field}
                >
                  <option value="">Seleccionar estado...</option>
                  <option value="Aguascalientes">Aguascalientes</option>
                  <option value="Baja California">Baja California</option>
                  <option value="Baja California Sur">Baja California Sur</option>
                  <option value="Campeche">Campeche</option>
                  <option value="Chiapas">Chiapas</option>
                  <option value="Chihuahua">Chihuahua</option>
                  <option value="Ciudad de México">Ciudad de México</option>
                  <option value="Coahuila">Coahuila</option>
                  <option value="Colima">Colima</option>
                  <option value="Durango">Durango</option>
                  <option value="Estado de México">Estado de México</option>
                  <option value="Guanajuato">Guanajuato</option>
                  <option value="Guerrero">Guerrero</option>
                  <option value="Hidalgo">Hidalgo</option>
                  <option value="Jalisco">Jalisco</option>
                  <option value="Michoacán">Michoacán</option>
                  <option value="Morelos">Morelos</option>
                  <option value="Nayarit">Nayarit</option>
                  <option value="Nuevo León">Nuevo León</option>
                  <option value="Oaxaca">Oaxaca</option>
                  <option value="Puebla">Puebla</option>
                  <option value="Querétaro">Querétaro</option>
                  <option value="Quintana Roo">Quintana Roo</option>
                  <option value="San Luis Potosí">San Luis Potosí</option>
                  <option value="Sinaloa">Sinaloa</option>
                  <option value="Sonora">Sonora</option>
                  <option value="Tabasco">Tabasco</option>
                  <option value="Tamaulipas">Tamaulipas</option>
                  <option value="Tlaxcala">Tlaxcala</option>
                  <option value="Veracruz">Veracruz</option>
                  <option value="Yucatán">Yucatán</option>
                  <option value="Zacatecas">Zacatecas</option>
                </select>
              )}
            />
            {errors.estado && (
              <div className="invalid-feedback">{errors.estado.message}</div>
            )}
          </div>
        )}

        {/* Prioridad de la regla */}
        <div className="col-md-4">
          <label htmlFor="prioridad" className="form-label text-secondary small">Prioridad</label>
          <Controller
            name="prioridad"
            control={control}
            render={({ field }) => (
              <select
                id="prioridad"
                className="form-select"
                {...field}
                value={field.value.toString()}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              >
                <option value="0">Baja (regla general)</option>
                <option value="1">Normal</option>
                <option value="2">Alta (regla específica)</option>
              </select>
            )}
          />
          <div className="form-text small">
            <i className="bi bi-info-circle me-1"></i>
            Las reglas de mayor prioridad sobrescriben a las de menor prioridad
          </div>
        </div>

        {/* Precio Base */}
        <div className="col-md-4">
          <label htmlFor="precio_base" className="form-label text-secondary small">Precio Base (MXN)</label>
          <Controller
            name="precio_base"
            control={control}
            rules={{
              required: 'El precio base es obligatorio',
              min: {
                value: 0,
                message: 'El precio debe ser mayor o igual a 0'
              }
            }}
            render={({ field }) => (
              <input
                type="number"
                step="0.01"
                id="precio_base"
                className={`form-control ${errors.precio_base ? 'is-invalid' : ''}`}
                placeholder="Ej: 50.00"
                disabled={watchEnvioGratis}
                {...field}
              />
            )}
          />
          {errors.precio_base && (
            <div className="invalid-feedback">{errors.precio_base.message}</div>
          )}
        </div>

        {/* Envío Gratis */}
        <div className="col-md-4">
          <label htmlFor="envio_gratis" className="form-label text-secondary small">Envío Gratis</label>
          <div className="d-flex align-items-center mt-2">
            <Controller
              name="envio_gratis"
              control={control}
              render={({ field }) => (
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="envio_gratis"
                    className="form-check-input"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      if (e.target.checked) {
                        setValue('precio_base', 0);
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="envio_gratis">
                    {field.value ? 'Sí' : 'No'}
                  </label>
                </div>
              )}
            />
          </div>
        </div>

        {/* Estado Activo/Inactivo */}
        <div className="col-md-4">
          <label htmlFor="activo" className="form-label text-secondary small">Estado</label>
          <Controller
            name="activo"
            control={control}
            render={({ field }) => (
              <select
                id="activo"
                className="form-select"
                {...field}
                value={field.value ? 'true' : 'false'}
                onChange={(e) => field.onChange(e.target.value === 'true')}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            )}
          />
        </div>

        {/* Códigos Postales (solo si no es regla por estado) */}
        {!watchIsStateRule && (
          <div className="col-12">
            <div className="mt-2 mb-1">
              <label className="form-label text-secondary small">Códigos Postales</label>
              {hasZipConflicts && (
                <div className="alert alert-warning py-2 mt-2">
                  <div className="d-flex">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2 mt-1"></i>
                    <div>
                      <p className="mb-1">
                        Se detectaron <strong>{conflictingZips.length}</strong> códigos postales que ya están asignados a otras reglas:
                      </p>
                      <ul className="mb-0 ps-3 small">
                        {conflictingZips.slice(0, 5).map((conflict, idx) => (
                          <li key={idx}>
                            <strong>{conflict.zipCode}</strong>: Asignado a la zona "{conflict.conflictRule.zona}"
                          </li>
                        ))}
                        {conflictingZips.length > 5 && (
                          <li>y {conflictingZips.length - 5} más...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <MultipleZipCodeSelector
                control={control}
                errors={errors}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};