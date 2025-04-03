import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useShippingServices } from '../hooks/useShippingServices';
import { DeliveryServicesSelector } from './DeliveryServicesSelector';
import { VariableShippingFields } from './VariableShippingFields';
import { RestrictedProductsSelector } from './RestrictedProductsSelector';

/**
 * Formulario para crear o editar reglas de envío.
 * Renovado para seguir el estilo minimalista del módulo Orders
 */
export const ShippingForm = ({ rule, isEdit = false, onSave, onCancel, onComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [newZipCode, setNewZipCode] = useState('');
  const [zipCodes, setZipCodes] = useState([]);

  // Obtener servicios de envío disponibles
  const { services, loading: loadingServices } = useShippingServices();

  // Configurar react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      zipcode: '',
      zipcodes: [],
      zona: '',
      precio_base: 0,
      activo: true,
      envio_gratis: false,
      opciones_mensajeria: [],
      envio_variable: {
        aplica: false,
        envio_gratis_monto_minimo: 999,
        costo_por_producto_extra: 0
      },
      productos_restringidos: []
    }
  });

  // Observar valores para UI condicional
  const watchVariableShipping = watch('envio_variable.aplica');
  const watchRestrictedProducts = watch('productos_restringidos', []);
  const watchEnvioGratis = watch('envio_gratis');
  const watchZipCodes = watch('zipcodes', []);

  // Cargar datos de la regla si estamos en modo edición
  useEffect(() => {
    if (isEdit && rule) {
      // Establecer los valores del formulario
      if (rule.zipcodes && Array.isArray(rule.zipcodes)) {
        setValue('zipcodes', rule.zipcodes);
        setZipCodes(rule.zipcodes);
      } else if (rule.zipcode) {
        // Compatibilidad con versión anterior
        setValue('zipcode', rule.zipcode);
        setValue('zipcodes', [rule.zipcode]);
        setZipCodes([rule.zipcode]);
      }
      
      setValue('zona', rule.zona);
      setValue('precio_base', rule.precio_base);
      setValue('activo', rule.activo);
      setValue('envio_gratis', rule.envio_gratis);
      setValue('opciones_mensajeria', rule.opciones_mensajeria || []);

      // Configurar envío variable
      if (rule.envio_variable && rule.envio_variable.aplica) {
        setValue('envio_variable.aplica', true);
        setValue('envio_variable.envio_gratis_monto_minimo',
          rule.envio_variable.envio_gratis_monto_minimo);
        setValue('envio_variable.costo_por_producto_extra',
          rule.envio_variable.costo_por_producto_extra);
      }

      // Configurar productos restringidos
      if (rule.productos_restringidos && rule.productos_restringidos.length > 0) {
        setValue('productos_restringidos', rule.productos_restringidos);
      }
    }
  }, [isEdit, rule, setValue]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setProcessing(true);
    setError(null);

    try {
      // Formatear valores numéricos
      const formattedData = {
        ...data,
        precio_base: parseFloat(data.precio_base),
        zipcodes: data.zipcodes
      };

      // Configurar envío variable
      if (!watchVariableShipping) {
        formattedData.envio_variable = { aplica: false };
      } else {
        formattedData.envio_variable = {
          ...data.envio_variable,
          envio_gratis_monto_minimo: parseFloat(data.envio_variable.envio_gratis_monto_minimo),
          costo_por_producto_extra: parseFloat(data.envio_variable.costo_por_producto_extra),
        };
      }

      // Guardar la regla
      const result = await onSave(isEdit ? rule.id : null, formattedData);

      if (result.ok) {
        onComplete();
      } else {
        setError(result.error || 'Error al guardar la regla de envío');
      }
    } catch (err) {
      console.error('Error en el formulario:', err);
      setError(err.message || 'Error al procesar el formulario');
    } finally {
      setProcessing(false);
    }
  };

  // Manejar la adición de un nuevo código postal
  const handleAddZipCode = () => {
    if (!newZipCode) return;
    
    // Validar formato del código postal
    if (!/^\d{5}$|^nacional$/.test(newZipCode)) {
      setError('Ingresa un código postal válido (5 dígitos) o "nacional"');
      return;
    }
    
    // Verificar si ya existe
    if (zipCodes.includes(newZipCode)) {
      setError('Este código postal ya ha sido agregado');
      return;
    }
    
    // Agregar el nuevo código postal
    const updatedZipCodes = [...zipCodes, newZipCode];
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
    setNewZipCode('');
    setError(null);
  };

  // Eliminar un código postal
  const handleRemoveZipCode = (zipToRemove) => {
    const updatedZipCodes = zipCodes.filter(zip => zip !== zipToRemove);
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
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
      <nav className="nav nav-tabs flex-nowrap mb-4 overflow-auto">
        <button
          className={`nav-link border-0 ${activeSection === 'basic' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
          onClick={() => setActiveSection('basic')}
        >
          <i className={`bi bi-info-circle me-2 ${activeSection === 'basic' ? 'text-white' : ''}`}></i>
          <span className="d-none d-sm-inline">Información Básica</span>
        </button>
        <button
          className={`nav-link border-0 ${activeSection === 'services' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
          onClick={() => setActiveSection('services')}
        >
          <i className={`bi bi-truck me-2 ${activeSection === 'services' ? 'text-white' : ''}`}></i>
          <span className="d-none d-sm-inline">Servicios</span>
        </button>
        <button
          className={`nav-link border-0 ${activeSection === 'advanced' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
          onClick={() => setActiveSection('advanced')}
        >
          <i className={`bi bi-gear me-2 ${activeSection === 'advanced' ? 'text-white' : ''}`}></i>
          <span className="d-none d-sm-inline">Configuración Avanzada</span>
        </button>
      </nav>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            {/* Sección de información básica */}
            {activeSection === 'basic' && (
              <div className="basic-info">
                <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Información General</h6>

                <div className="row g-4 mb-4">
                  {/* Códigos Postales */}
                  <div className="col-12 mb-2">
                    <label className="form-label text-secondary fw-medium">Códigos Postales</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: 72000 o nacional"
                        value={newZipCode}
                        onChange={(e) => setNewZipCode(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={handleAddZipCode}
                      >
                        <i className="bi bi-plus-lg"></i> Agregar
                      </button>
                    </div>
                    <small className="text-muted">Agrega uno o más códigos postales para esta regla de envío</small>
                    
                    {/* Lista de códigos postales */}
                    {zipCodes.length > 0 && (
                      <div className="mt-3">
                        <div className="d-flex flex-wrap gap-2">
                          {zipCodes.map((zip, index) => (
                            <div key={index} className="badge bg-light text-dark border d-flex align-items-center p-2">
                              <span>{zip}</span>
                              <button 
                                type="button" 
                                className="btn-close ms-2" 
                                onClick={() => handleRemoveZipCode(zip)}
                                aria-label="Eliminar código postal"
                              ></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Campo oculto para almacenar los códigos postales */}
                    <Controller
                      name="zipcodes"
                      control={control}
                      rules={{
                        validate: value => value.length > 0 || 'Agrega al menos un código postal'
                      }}
                      render={({ field }) => (
                        <input type="hidden" {...field} value={JSON.stringify(field.value)} />
                      )}
                    />
                    {errors.zipcodes && (
                      <div className="text-danger small mt-1">{errors.zipcodes.message}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <hr className="text-muted opacity-25 my-1" />
                  </div>

                  {/* Zona */}
                  <div className="col-12">
                    <label htmlFor="zona" className="form-label text-secondary fw-medium">Zona</label>
                    <Controller
                      name="zona"
                      control={control}
                      rules={{
                        required: 'La zona es obligatoria'
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
                    <small className="text-muted d-block mt-1">
                      Define un nombre descriptivo para la zona de cobertura
                    </small>
                  </div>

                  <div className="col-12">
                    <hr className="text-muted opacity-25 my-1" />
                  </div>

                  {/* Envío Gratis */}
                  <div className="col-12">
                    <label htmlFor="envio_gratis" className="form-label text-secondary fw-medium">Configuración de Envío</label>
                    <div className="card border-0 bg-light rounded-3 p-3 mt-2">
                      <div className="d-flex align-items-center">
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
                              <label className="form-check-label fw-medium" htmlFor="envio_gratis">
                                {field.value ? 'Sí, el envío es gratuito' : 'No, el envío tiene costo'}
                              </label>
                            </div>
                          )}
                        />
                      </div>
                      <small className="text-muted d-block mt-2">
                        {watchEnvioGratis ? 
                          "El cliente no pagará por el envío en esta zona" : 
                          "El cliente deberá pagar el costo de envío definido a continuación"}
                      </small>
                      
                      {/* Precio Base - Solo visible cuando NO es envío gratis */}
                      {!watchEnvioGratis && (
                        <div className="mt-3" style={{ transition: 'all 0.3s ease' }}>
                          <label htmlFor="precio_base" className="form-label text-secondary small">
                            Costo de envío para el cliente
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">$</span>
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
                                  {...field}
                                />
                              )}
                            />
                            <span className="input-group-text bg-white">MXN</span>
                          </div>
                          {errors.precio_base && (
                            <div className="invalid-feedback d-block">{errors.precio_base.message}</div>
                          )}
                          <small className="text-muted d-block mt-1">
                            Este es el costo que pagará el cliente por el envío
                          </small>
                        </div>
                      )}
                      
                      {/* Campo oculto para precio_base cuando es envío gratis */}
                      {watchEnvioGratis && (
                        <Controller
                          name="precio_base"
                          control={control}
                          render={({ field }) => (
                            <input type="hidden" {...field} value="0" />
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <hr className="text-muted opacity-25 my-1" />
                  </div>

                  {/* Estado */}
                  <div className="col-12">
                    <label htmlFor="activo" className="form-label text-secondary fw-medium">Estado</label>
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
                    <small className="text-muted d-block mt-1">
                      Determina si esta regla de envío está disponible para los clientes
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de servicios de mensajería */}
            {activeSection === 'services' && (
              <div className="shipping-services">
                <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Servicios de Mensajería</h6>

                <DeliveryServicesSelector
                  control={control}
                  services={services}
                  loading={loadingServices}
                />
              </div>
            )}

            {/* Sección de configuración avanzada */}
            {activeSection === 'advanced' && (
              <div className="advanced-settings">
                <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Configuración Avanzada</h6>

                {/* Toggle para envío variable */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <Controller
                      name="envio_variable.aplica"
                      control={control}
                      render={({ field }) => (
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            id="envio_variable.aplica"
                            className="form-check-input"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          <label className="form-check-label ms-2" htmlFor="envio_variable.aplica">
                            <span className="fw-medium">Envío variable</span>
                            <small className="text-muted d-block">
                              Configura precios variables según monto o número de productos
                            </small>
                          </label>
                        </div>
                      )}
                    />
                  </div>

                  {/* Campos de envío variable */}
                  {watchVariableShipping && (
                    <VariableShippingFields
                      control={control}
                      errors={errors}
                      className="mb-4"
                    />
                  )}
                </div>

                {/* Productos restringidos */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-medium">Productos restringidos</span>
                    <small className="text-muted">
                      {watchRestrictedProducts.length} producto(s) configurado(s)
                    </small>
                  </div>

                  <RestrictedProductsSelector
                    control={control}
                  />
                </div>
              </div>
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
}