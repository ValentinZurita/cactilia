import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useShippingServices } from '../hooks/useShippingServices';
import { ShippingServiceForm } from './ShippingServiceForm.jsx'


/**
 * Componente para gestionar servicios de envío.
 * Muestra una lista de servicios y permite crear, editar y eliminar.
 */
export const ShippingServiceManager = ({ onServiceSelect = null }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    services,
    loading,
    error,
    refreshServices,
    createService,
    updateService,
    deleteService
  } = useShippingServices();

  // Filtrar servicios por término de búsqueda
  const filteredServices = services.filter(service =>
    service.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir formulario para crear nuevo servicio
  const handleCreateNew = () => {
    setSelectedService(null);
    setShowForm(true);
  };

  // Abrir formulario para editar servicio
  const handleEdit = (service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedService(null);
  };

  // Guardar servicio (crear o actualizar)
  const handleSaveService = async (data, serviceId = null) => {
    if (serviceId) {
      // Actualizar servicio existente
      return await updateService(serviceId, data);
    } else {
      // Crear nuevo servicio
      return await createService(data);
    }
  };

  // Manejar eliminación de servicio
  const handleDelete = async (serviceId) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio de envío?')) {
      const result = await deleteService(serviceId);

      if (result.ok) {
        await refreshServices();
      } else {
        alert(result.error || 'Error al eliminar el servicio');
      }
    }
  };

  // Seleccionar servicio (si se usa como selector)
  const handleSelectService = (service) => {
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };

  return (
    <div className="shipping-service-manager">
      {/* Barra de herramientas */}
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        {/* Buscador */}
        <div className="search-container flex-grow-1" style={{ maxWidth: '500px' }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Buscar servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar servicios"
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary border-start-0"
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* Botón para crear nuevo servicio */}
        <button
          className="btn btn-outline-dark rounded-3"
          onClick={handleCreateNew}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nuevo Servicio
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger py-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando servicios de envío...</p>
        </div>
      )}

      {/* Lista de servicios */}
      {!loading && filteredServices.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="list-group list-group-flush">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="list-group-item d-flex justify-content-between align-items-start p-3 bg-white"
              >
                <div className="ms-2 me-auto"
                     onClick={() => handleSelectService(service)}
                     style={{ cursor: onServiceSelect ? 'pointer' : 'default' }}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-truck text-secondary me-3 fs-5"></i>
                    <div>
                      <div className="fw-medium">{service.nombre}</div>
                      <div className="d-flex gap-3 text-muted small mt-1">
                        <div>${parseFloat(service.precio_base).toFixed(2)} MXN</div>
                        <div>{service.descripcion || service.tiempo_estimado}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex">
                  <span className={`badge me-2 bg-${service.activo ? 'success' : 'secondary'} bg-opacity-10 text-${service.activo ? 'success' : 'secondary'}`}>
                    {service.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleEdit(service)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(service.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay servicios */}
      {!loading && filteredServices.length === 0 && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-5 text-center">
            <i className="bi bi-truck fs-1 text-secondary opacity-50 d-block mb-3"></i>
            <h5 className="text-secondary fw-normal">No hay servicios de envío configurados</h5>
            <p className="text-muted mb-4">Añade tu primer servicio de envío.</p>
            <button
              className="btn btn-outline-dark"
              onClick={handleCreateNew}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nuevo Servicio
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear/editar servicio */}
      <Modal
        show={showForm}
        onHide={handleCloseForm}
        backdrop="static"
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedService ? 'Editar Servicio' : 'Nuevo Servicio de Envío'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ShippingServiceForm
            service={selectedService}
            onSave={async (data, serviceId) => {
              const result = await handleSaveService(data, serviceId);
              if (result.ok) {
                await refreshServices();
                handleCloseForm();
              }
              return result;
            }}
            onCancel={handleCloseForm}
            isModal={true}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};