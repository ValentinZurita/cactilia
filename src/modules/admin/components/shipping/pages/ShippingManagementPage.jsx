import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShippingTable } from '../table/ShippingTable';
import { ShippingForm } from '../form/ShippingForm';
import { useShippingRules } from '../hooks/useShippingRules';

/**
 * Página principal para la gestión de reglas de envío.
 * Versión renovada con estilo similar al módulo de Orders
 */
export const ShippingManagementPage = () => {
  const { mode, id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [submissionError, setSubmissionError] = useState(null);

  const {
    shippingRules,
    loading,
    error,
    selectedRule,
    createShippingRule,
    updateShippingRule,
    deleteShippingRule,
    getShippingRuleById,
    filterShippingRules
  } = useShippingRules();

  // Cargar la regla para editar si estamos en modo 'edit'
  useEffect(() => {
    if (mode === 'edit' && id) {
      getShippingRuleById(id);
    }
  }, [mode, id, getShippingRuleById]);

  // Manejar cambio en la búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    filterShippingRules(term);
  };

  // Manejar navegación
  const handleBackToList = () => navigate('/admin/shipping');
  const handleCreateNew = () => navigate('/admin/shipping/create');
  const handleEditRule = (ruleId) => navigate(`/admin/shipping/edit/${ruleId}`);

  // Función para manejar el guardado de una regla
  const handleSaveRule = async (data) => {
    setSubmissionError(null);
    
    // Adaptar el formato de los datos para el backend
    const adaptedData = {
      // Datos básicos
      zipcode: data.zipcodes && data.zipcodes.length > 0 ? data.zipcodes[0] : '',
      zipcodes: data.zipcodes || [],
      zona: data.name || '',
      activo: data.activo !== undefined ? data.activo : true,
      
      // Métodos de envío
      opciones_mensajeria: data.shippingTypes
        ? data.shippingTypes.map(type => ({
            nombre: type.carrier,
            label: type.label,
            precio: type.price,
            peso_maximo: type.weight || 0,
            tiempo_entrega: `${type.minDays}-${type.maxDays} días`,
            minDays: type.minDays,
            maxDays: type.maxDays,
            // Incluir campos de rangos de peso
            usaRangosPeso: type.usaRangosPeso || false,
            rangosPeso: type.rangosPeso || [],
            // Configuración de paquetes específica para cada opción
            configuracion_paquetes: {
              peso_maximo_paquete: type.maxPackageWeight || 20,
              costo_por_kg_extra: type.extraWeightCost || 10,
              maximo_productos_por_paquete: type.maxProductsPerPackage || 10
            }
          }))
        : [],
      
      // Reglas de precio
      envio_gratis: data.freeShipping || false,
      precio_base: 0, // Este campo es para compatibilidad
      
      // Otras propiedades
      envio_variable: {
        aplica: !!data.freeShippingThreshold,
        envio_gratis_monto_minimo: data.minOrderAmount || 0,
        costo_por_producto_extra: 0 // Por ahora no se usa
      }
    };
    
    try {
      let result;
      
      if (mode === 'edit' && id) {
        result = await updateShippingRule(id, adaptedData);
      } else {
        result = await createShippingRule(null, adaptedData);
      }
      
      if (result.ok) {
        handleBackToList();
      } else {
        setSubmissionError(result.error || 'Error al guardar la regla');
        alert(result.error || 'Error al guardar la regla');
      }
    } catch (err) {
      console.error('Error al guardar la regla:', err);
      setSubmissionError(err.message || 'Error inesperado al guardar la regla');
      alert(err.message || 'Error inesperado al guardar la regla');
    }
  };

  // Título dinámico según el modo
  const getPageTitle = () => {
    switch (mode) {
      case 'create': return 'Nueva Regla de Envío';
      case 'edit': return 'Editar Regla de Envío';
      default: return 'Gestión de Envíos';
    }
  };

  // Renderizar vista según el modo
  const renderContent = () => {
    switch (mode) {
      case 'create':
        return (
          <ShippingForm
            initialData={{}}
            onSubmit={handleSaveRule}
            onCancel={handleBackToList}
          />
        );
      case 'edit':
        // Adaptar los datos existentes al formato del nuevo formulario
        const adaptedInitialData = selectedRule ? {
          name: selectedRule.zona || '',
          zipcodes: selectedRule.zipcodes || [selectedRule.zipcode].filter(Boolean),
          activo: selectedRule.activo !== undefined ? selectedRule.activo : true,
          status: selectedRule.activo !== undefined ? selectedRule.activo : true,
          
          // Reglas
          freeShipping: selectedRule.envio_gratis || false,
          freeShippingThreshold: selectedRule.envio_variable?.aplica || false,
          minOrderAmount: selectedRule.envio_variable?.envio_gratis_monto_minimo || 0,
          
          // Métodos de envío
          shippingTypes: selectedRule.opciones_mensajeria
            ? selectedRule.opciones_mensajeria.map((option, index) => ({
                id: `${index + 1}`,
                carrier: option.nombre || '',
                label: option.label || option.nombre || '',
                price: option.precio || 0,
                weight: option.peso_maximo || 0,
                minDays: option.minDays || 1,
                maxDays: option.maxDays || 3,
                // Agregar nuevos campos de rangos de peso
                usaRangosPeso: option.usaRangosPeso || false,
                rangosPeso: option.rangosPeso || [],
                // Configuración de paquetes específica para cada opción
                maxPackageWeight: option.configuracion_paquetes?.peso_maximo_paquete || 20,
                extraWeightCost: option.configuracion_paquetes?.costo_por_kg_extra || 10,
                maxProductsPerPackage: option.configuracion_paquetes?.maximo_productos_por_paquete || 10
              }))
            : []
        } : {};
        
        return (
          <ShippingForm
            initialData={adaptedInitialData}
            onSubmit={handleSaveRule}
            onCancel={handleBackToList}
          />
        );
      default:
        return (
          <ShippingTable
            rules={shippingRules}
            loading={loading}
            error={error}
            onEdit={handleEditRule}
            onDelete={deleteShippingRule}
            onSearch={handleSearch}
            searchTerm={searchTerm}
            onCreateNew={handleCreateNew}
          />
        );
    }
  };

  return (
    <div className="order-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-title fw-medium mb-0">
          {getPageTitle()}
        </h3>

        {/* Botón para volver en vistas de detalle/creación/edición */}
        {(mode === 'create' || mode === 'edit') && (
          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={handleBackToList}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        )}
      </div>

      {/* Mostrar error global si existe */}
      {(error || submissionError) && !['create', 'edit'].includes(mode) && (
        <div className="alert alert-danger py-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || submissionError}
        </div>
      )}

      {renderContent()}
    </div>
  );
};