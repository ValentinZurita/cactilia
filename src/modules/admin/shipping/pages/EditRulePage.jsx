import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ShippingForm from '../ShippingForm';
import { useShippingRules } from '../hooks/useShippingRules';

/**
 * Página para editar una regla de envío existente
 */
const EditRulePage = () => {
  // Obtener ID de la URL
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obtener funciones
  const { getRuleById, updateRule } = useShippingRules();
  
  // Cargar datos de la regla
  useEffect(() => {
    const fetchRule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener regla
        const rule = await getRuleById(id);
        
        // Transformar datos si es necesario
        const formattedRule = {
          ...rule,
          freeShipping: rule.envio_gratis || false,
          freeShippingThreshold: rule.monto_minimo_gratis ? true : false,
          minOrderAmount: rule.monto_minimo_gratis || 0
        };
        
        setInitialData(formattedRule);
      } catch (err) {
        setError(err.message || `Error al cargar la regla ${id}`);
        console.error(`Error al cargar regla ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRule();
    }
  }, [id, getRuleById]);
  
  /**
   * Manejar actualización de regla
   * @param {Object} data - Datos del formulario
   */
  const handleUpdateRule = async (data) => {
    try {
      setError(null);
      
      // Actualizar regla
      const result = await updateRule(id, data);
      
      // Mostrar mensaje y redireccionar
      alert('Regla de envío actualizada exitosamente');
      navigate('/admin/shipping');
      
      return result;
    } catch (err) {
      setError(err.message || `Error al actualizar regla ${id}`);
      console.error(`Error al actualizar regla ${id}:`, err);
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
  
  // Mostrar mensaje de carga
  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <h5 className="text-muted">Cargando datos de la regla...</h5>
      </div>
    );
  }
  
  // Mostrar error si no se pudo cargar
  if (error && !initialData) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <div className="mt-3">
            <Link to="/admin/shipping" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="edit-rule-page container-fluid py-4">
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
                Editar Regla
              </li>
            </ol>
          </nav>
          
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">Editar Regla de Envío</h1>
              <p className="text-muted">
                {initialData?.zona ? `Editando: ${initialData.zona}` : 'Modificar una regla de envío existente'}
              </p>
            </div>
            
            <div className="d-flex align-items-center">
              <span className="badge me-2 px-3 py-2 rounded-pill bg-secondary bg-opacity-10 text-secondary">
                ID: {id}
              </span>
              
              {initialData?.activo !== undefined && (
                <span 
                  className={`badge px-3 py-2 rounded-pill ${
                    initialData.activo 
                      ? 'bg-success bg-opacity-10 text-success' 
                      : 'bg-secondary bg-opacity-10 text-secondary'
                  }`}
                >
                  <i className={`bi ${initialData.activo ? 'bi-check-circle' : 'bi-dash-circle'} me-1`}></i>
                  {initialData.activo ? 'Activo' : 'Inactivo'}
                </span>
              )}
            </div>
          </div>
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
              {initialData && (
                <ShippingForm 
                  initialData={initialData}
                  onSubmit={handleUpdateRule}
                  onCancel={handleCancel}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRulePage; 