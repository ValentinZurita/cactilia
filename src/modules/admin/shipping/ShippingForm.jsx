import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useShippingForm } from './hooks/useShippingForm';
import {
  NavigationTabs,
  CoverageSection,
  RulesSection,
  MethodsSection,
  ZipCodeSelector
} from './components/form';
import { FORM_STEPS } from './constants';
import ProductBatchService from '../../shop/services/productBatchService';

/**
 * Componente principal para el formulario de reglas de envío
 * Maneja la creación y edición de reglas
 * @param {Object} initialData - Datos iniciales para edición
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} onCancel - Función a ejecutar al cancelar
 */
const ShippingForm = ({
  initialData = null,
  onSubmit = () => {},
  onCancel = () => {}
}) => {
  // Estado para productos asociados a esta regla (en modo edición)
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Usar el hook para manejar el formulario
  const {
    currentStep,
    isSubmitting,
    submitError,
    errors,
    formValues,
    control,
    watch,
    setValue,
    handleSubmit,
    goToStep,
    nextStep,
    prevStep,
    resetForm
  } = useShippingForm(initialData, onSubmit);
  
  // Determinar si es edición o creación
  const isEditing = Boolean(initialData?.id);
  
  // Cargar productos asociados cuando se edita una regla
  useEffect(() => {
    const fetchLinkedProducts = async () => {
      if (isEditing && initialData?.id) {
        setLoadingProducts(true);
        try {
          // Usar el servicio para obtener productos vinculados a esta regla
          const products = await ProductBatchService.getProductsByShippingRule(
            initialData.id,
            { onlyActive: false }
          );
          setLinkedProducts(products);
        } catch (error) {
          console.error('Error al cargar productos asociados:', error);
        } finally {
          setLoadingProducts(false);
        }
      }
    };
    
    fetchLinkedProducts();
  }, [isEditing, initialData?.id]);
  
  // Manejar cambio de pestaña
  const handleTabClick = (tabIndex) => {
    goToStep(tabIndex);
  };
  
  // Renderizar sección actual según el paso
  const renderCurrentSection = () => {
    switch (currentStep) {
      case FORM_STEPS.BASIC_INFO:
        return (
          <>
            <CoverageSection
              control={control}
              errors={errors}
              watch={watch}
            />
            <ZipCodeSelector
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
            
            {/* Mostrar productos vinculados solo en modo edición */}
            {isEditing && (
              <div className="mt-5 pt-3 border-top">
                <h6 className="text-dark mb-3">Productos asociados</h6>
                
                {loadingProducts ? (
                  <div className="text-muted small">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cargando productos asociados...
                  </div>
                ) : linkedProducts.length > 0 ? (
                  <div>
                    <div className="alert alert-info small mb-3">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      Esta regla de envío está siendo utilizada en {linkedProducts.length} producto(s).
                      Cualquier cambio afectará a estos productos.
                    </div>
                    
                    <div className="table-responsive border rounded">
                      <table className="table table-sm table-hover small mb-0">
                        <thead className="table-light">
                          <tr>
                            <th scope="col">Nombre</th>
                            <th scope="col">SKU</th>
                            <th scope="col">Precio</th>
                            <th scope="col">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {linkedProducts.slice(0, 5).map(product => (
                            <tr key={product.id}>
                              <td>{product.name}</td>
                              <td className="text-muted">{product.sku}</td>
                              <td>${parseFloat(product.price).toFixed(2)}</td>
                              <td>
                                <span className={`badge ${product.active ? 'bg-success' : 'bg-secondary'} bg-opacity-10 
                                              ${product.active ? 'text-success' : 'text-secondary'} small`}>
                                  {product.active ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          
                          {linkedProducts.length > 5 && (
                            <tr>
                              <td colSpan="4" className="text-center text-muted">
                                Y {linkedProducts.length - 5} producto(s) más...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-light border text-muted small">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay productos asociados a esta regla de envío.
                  </div>
                )}
              </div>
            )}
          </>
        );
      
      case FORM_STEPS.RULES:
        return (
          <RulesSection
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case FORM_STEPS.METHODS:
        return (
          <MethodsSection
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="shipping-form-container">
      <form onSubmit={handleSubmit} className="shipping-form">
        {/* Navegación entre secciones */}
        <NavigationTabs
          currentStep={currentStep}
          onTabClick={handleTabClick}
        />
        
        {/* Mostrar error de envío */}
        {submitError && (
          <div className="alert alert-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {submitError}
          </div>
        )}
        
        {/* Sección actual */}
        <div className="form-section">
          {renderCurrentSection()}
        </div>
        
        {/* Botones de navegación y acciones */}
        <div className="d-flex justify-content-between mt-4 pt-4 border-top">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Anterior
              </button>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            {currentStep < Object.values(FORM_STEPS).length - 1 ? (
              <button
                type="button"
                className="btn btn-dark"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Siguiente
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2"></i>
                    {isEditing ? 'Actualizar Regla' : 'Crear Regla'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

ShippingForm.propTypes = {
  /** Datos iniciales para edición */
  initialData: PropTypes.object,
  /** Función a ejecutar al enviar el formulario */
  onSubmit: PropTypes.func,
  /** Función a ejecutar al cancelar */
  onCancel: PropTypes.func
};

export default ShippingForm; 