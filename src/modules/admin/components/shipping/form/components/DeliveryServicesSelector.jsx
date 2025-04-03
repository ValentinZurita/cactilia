import React, { useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';

/**
 * Componente para seleccionar y configurar servicios de mensajería.
 * Versión renovada con diseño minimalista
 */
const DeliveryServicesSelector = ({ control, services = [], loading = false }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "opciones_mensajeria"
  });

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customTime, setCustomTime] = useState('');

  // Verificar si un servicio ya está añadido
  const isServiceAdded = (serviceId) => {
    return fields.some(field => field.nombre === serviceId);
  };

  // Añadir servicio seleccionado
  const handleAddService = () => {
    if (!selectedServiceId) return;

    const selectedService = services.find(s => s.id === selectedServiceId);

    if (selectedService && !isServiceAdded(selectedService.nombre)) {
      append({
        nombre: selectedService.nombre,
        precio: parseFloat(customPrice || selectedService.precio_base),
        tiempo: customTime || selectedService.descripcion
      });

      // Resetear selección
      setSelectedServiceId('');
      setCustomPrice('');
      setCustomTime('');
    }
  };

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-secondary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="ms-2 text-muted">Cargando servicios...</span>
      </div>
    );
  }

  return (
    <div className="delivery-services-selector">
      {/* Formulario para añadir servicio */}
      <div className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label text-secondary small">Servicio</label>
            <select
              className="form-select"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              aria-label="Seleccionar servicio de mensajería"
            >
              <option value="">Seleccionar servicio...</option>
              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                  disabled={isServiceAdded(service.nombre)}
                >
                  {service.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label text-secondary small">Precio (MXN)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              placeholder="Personalizado"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              aria-label="Precio personalizado"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label text-secondary small">Tiempo de Entrega</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: 3-5 días"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              aria-label="Tiempo de entrega"
            />
          </div>

          <div className="col-md-2">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleAddService}
              disabled={!selectedServiceId}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Añadir
            </button>
          </div>
        </div>
      </div>

      {/* Lista de servicios seleccionados */}
      {fields.length > 0 ? (
        <div className="card border-0 rounded-4 bg-light p-0 mb-3">
          <ul className="list-group list-group-flush rounded-4">
            {fields.map((item, index) => (
              <li key={item.id} className="list-group-item bg-transparent d-flex justify-content-between align-items-center p-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-truck text-secondary me-3"></i>
                  <div>
                    <Controller
                      name={`opciones_mensajeria.${index}.nombre`}
                      control={control}
                      render={({ field }) => (
                        <div className="fw-medium">{field.value}</div>
                      )}
                    />
                    <div className="d-flex gap-3 text-muted small mt-1">
                      <div>
                        <Controller
                          name={`opciones_mensajeria.${index}.precio`}
                          control={control}
                          render={({ field }) => (
                            <span>${parseFloat(field.value).toFixed(2)} MXN</span>
                          )}
                        />
                      </div>
                      <div>
                        <Controller
                          name={`opciones_mensajeria.${index}.tiempo`}
                          control={control}
                          render={({ field }) => (
                            <span>{field.value}</span>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-pill"
                    onClick={() => remove(index)}
                    aria-label="Eliminar servicio"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="alert alert-secondary py-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle text-secondary me-3 fs-4"></i>
            <div>
              <p className="mb-0">No has seleccionado ningún servicio de mensajería</p>
              <p className="mb-0 small text-muted">Añade al menos un servicio para esta regla de envío</p>
            </div>
          </div>
        </div>
      )}

      {/* Formas de editar precios y tiempos */}
      {fields.length > 0 && (
        <div className="mb-4 mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-medium">Configuración detallada</h6>
            <span className="badge bg-secondary bg-opacity-10 text-secondary small">Opcional</span>
          </div>

          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead className="table-light">
              <tr>
                <th className="text-secondary small">Servicio</th>
                <th className="text-secondary small">Precio (MXN)</th>
                <th className="text-secondary small">Tiempo de Entrega</th>
              </tr>
              </thead>
              <tbody>
              {fields.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <Controller
                      name={`opciones_mensajeria.${index}.nombre`}
                      control={control}
                      render={({ field }) => (
                        <input type="text" className="form-control form-control-sm" {...field} readOnly />
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      name={`opciones_mensajeria.${index}.precio`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          step="0.01"
                          className="form-control form-control-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      name={`opciones_mensajeria.${index}.tiempo`}
                      control={control}
                      render={({ field }) => (
                        <input type="text" className="form-control form-control-sm" {...field} />
                      )}
                    />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryServicesSelector; 