import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShippingForm from '../ShippingForm';
import { useShippingRules } from '../hooks/useShippingRules';

/**
 * Página para crear una nueva regla de envío
 */
const CreateRulePage = () => {
  const navigate = useNavigate();
  const { createRule } = useShippingRules();
  const [error, setError] = useState(null);
  
  /**
   * Manejar creación de regla
   * @param {Object} data - Datos del formulario
   */
  const handleCreateRule = async (data) => {
    try {
      setError(null);
      
      // Crear regla
      const result = await createRule(data);
      
      // Mostrar mensaje y redireccionar
      alert('Regla de envío creada exitosamente');
      navigate('/admin/shipping');
      
      return result;
    } catch (err) {
      setError(err.message || 'Error al crear regla de envío');
      console.error('Error al crear regla:', err);
      throw err;
    }
  };
  
  /**
   * Manejar cancelación
   */
  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.')) {
      navigate('/admin/shipping');
    }
  };
  
  return (
    <div className="create-rule-page container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/admin/home">Inicio</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/admin/shipping">Reglas de Envío</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Nueva Regla
              </li>
            </ol>
          </nav>
          
          <h1 className="h3 mb-2">Nueva Regla de Envío</h1>
          <p className="text-muted">
            Configura una nueva regla de envío para una zona geográfica específica.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      
      <div className="row">
        <div className="col-lg-10 col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <ShippingForm 
                onSubmit={handleCreateRule}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRulePage; 