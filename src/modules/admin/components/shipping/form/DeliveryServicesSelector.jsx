import React, { useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';

/**
 * Componente para seleccionar y configurar servicios de mensajería.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.control - Control de react-hook-form
 * @param {Array} props.services - Lista de servicios disponibles
 * @param {boolean} props.loading - Indicador de carga
 */
export const DeliveryServicesSelector = ({ control, services = [], loading = false }) => {
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
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="ms-2">Cargando servicios...</span>
      </div>
    );
  }

  return (
    <div className="delivery-services-selector">
      {/* Tabla de servicios seleccionados */}
      {fields.length > 0 && (
        <div className="table-responsive mb-3">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
            <tr>
              <th style={{ width: '40%' }}>Servicio</th>
              <th style={{ width: '25%' }}>Precio (MXN)</th>
              <th style={{ width: '25%' }}>Tiempo de Entrega</th>
              <th style={{ width: '10%' }}>Acciones</th>
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
                      <input type="text" className="form-control" {...field} readOnly />
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
                        className="form-control"
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
                      <input type="text" className="form-control" {...field} />
                    )}
                  />
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => remove(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario para añadir nuevo servicio */}
      <div className="card bg-light border-0 rounded-3 mb-3">
        <div className="card-body">
          <h6 className="card-title">Añadir Servicio de Mensajería</h6>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Servicio</label>
              <select
                className="form-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
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
              <label className="form-label">Precio (MXN)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Personalizado"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Tiempo de Entrega</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: 3-5 días"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleAddService}
                disabled={!selectedServiceId}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay servicios */}
      {fields.length === 0 && (
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          No has seleccionado ningún servicio de mensajería. Añade al menos uno.
        </div>
      )}
    </div>
  );
};