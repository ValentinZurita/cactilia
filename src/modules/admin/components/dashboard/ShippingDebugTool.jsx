import React, { useState, useEffect } from 'react';
import { fetchShippingRules, fetchShippingRuleById } from '../../services/shippingRuleService';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../../config/firebase/firebaseConfig';

/**
 * Herramienta de diagnóstico para reglas de envío
 * Permite ver, diagnosticar y reparar reglas de envío
 */
export const ShippingDebugTool = () => {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Cargar reglas de envío al montar
  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const result = await fetchShippingRules();
        
        if (result.ok) {
          setRules(result.data);
          console.log('Reglas cargadas:', result.data);
        } else {
          setError('Error al cargar reglas: ' + result.error);
        }
      } catch (err) {
        setError('Error inesperado: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadRules();
  }, []);
  
  // Cargar productos con reglas de envío
  const loadProductsWithRules = async () => {
    try {
      setLoading(true);
      setStatusMessage('Cargando productos...');
      
      const productsRef = collection(FirebaseDB, 'products');
      const snapshot = await getDocs(productsRef);
      
      const productsData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.shippingRuleId || (data.shippingRuleIds && data.shippingRuleIds.length > 0)) {
          productsData.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      setProducts(productsData);
      setStatusMessage(`Se encontraron ${productsData.length} productos con reglas de envío`);
      
    } catch (err) {
      setError('Error al cargar productos: ' + err.message);
      setStatusMessage('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar una regla específica
  const verifyRule = async (ruleId) => {
    try {
      setLoading(true);
      setStatusMessage(`Verificando regla ${ruleId}...`);
      
      const result = await fetchShippingRuleById(ruleId);
      
      if (result.ok) {
        setSelectedRule(result.data);
        setStatusMessage(`Regla ${ruleId} encontrada: ${result.data.zona}`);
      } else {
        setError('Error al verificar regla: ' + result.error);
        setStatusMessage(`Error al verificar regla ${ruleId}`);
      }
    } catch (err) {
      setError('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Reparar un producto con problemas de reglas de envío
  const repairProduct = async (productId) => {
    try {
      setLoading(true);
      setStatusMessage(`Reparando producto ${productId}...`);
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        setError('Producto no encontrado');
        return;
      }
      
      // Crear datos limpios para actualizar
      const cleanData = {};
      
      // Normalizar las reglas de envío
      if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0) {
        // Filtrar IDs vacíos o nulos
        const validRuleIds = product.shippingRuleIds.filter(id => id && id.trim() !== '');
        cleanData.shippingRuleIds = validRuleIds;
        
        // Actualizar shippingRuleId para compatibilidad
        if (validRuleIds.length > 0) {
          cleanData.shippingRuleId = validRuleIds[0];
        } else {
          cleanData.shippingRuleId = null;
        }
      }
      else if (product.shippingRuleId && !product.shippingRuleIds) {
        // Si solo tiene shippingRuleId, crear el array
        cleanData.shippingRuleIds = [product.shippingRuleId];
        cleanData.shippingRuleId = product.shippingRuleId;
      }
      
      // Eliminar campos problemáticos
      delete cleanData.shippingRulesInfo;
      delete cleanData.shippingRuleInfo;
      
      console.log('Actualizando producto con datos:', cleanData);
      
      // Actualizar en Firestore
      const productRef = doc(FirebaseDB, 'products', productId);
      await updateDoc(productRef, cleanData);
      
      // Actualizar la lista local de productos
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId 
            ? { ...p, ...cleanData } 
            : p
        )
      );
      
      setStatusMessage(`Producto ${productId} reparado exitosamente`);
    } catch (err) {
      setError('Error al reparar producto: ' + err.message);
      setStatusMessage(`Error al reparar producto ${productId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h2>Herramienta de Diagnóstico de Reglas de Envío</h2>
      
      {error && (
        <div className="alert alert-danger">
          {error}
          <button 
            className="btn-close float-end" 
            onClick={() => setError(null)}
            aria-label="Cerrar"
          />
        </div>
      )}
      
      {statusMessage && (
        <div className="alert alert-info">
          {statusMessage}
        </div>
      )}
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Reglas de Envío Disponibles</h5>
            </div>
            <div className="card-body">
              {loading && rules.length === 0 ? (
                <p>Cargando reglas...</p>
              ) : (
                <div className="list-group">
                  {rules.map(rule => (
                    <button
                      key={rule.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => verifyRule(rule.id)}
                    >
                      <span>
                        {rule.zona || 'Sin nombre'} 
                        <span className="text-muted ms-2">({rule.id})</span>
                      </span>
                      <span className={`badge ${rule.activo !== false ? 'bg-success' : 'bg-danger'}`}>
                        {rule.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer">
              <button 
                className="btn btn-primary" 
                onClick={loadProductsWithRules}
                disabled={loading}
              >
                Cargar Productos con Reglas
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Detalle de Regla</h5>
            </div>
            <div className="card-body">
              {selectedRule ? (
                <div>
                  <h5>{selectedRule.zona || 'Sin nombre'}</h5>
                  <p><strong>ID:</strong> {selectedRule.id}</p>
                  <p><strong>Estado:</strong> {selectedRule.activo !== false ? 'Activo' : 'Inactivo'}</p>
                  
                  <h6 className="mt-3">Opciones de Mensajería:</h6>
                  <ul className="list-group">
                    {selectedRule.opciones_mensajeria?.map((opcion, index) => (
                      <li key={index} className="list-group-item">
                        <p className="mb-1"><strong>{opcion.nombre}</strong> - ${opcion.precio}</p>
                        <p className="mb-1 small text-muted">Tiempo de entrega: {opcion.tiempo_entrega || 'No especificado'}</p>
                        
                        {opcion.configuracion_paquetes && (
                          <div className="small">
                            <p className="mb-0">Peso máximo: {opcion.configuracion_paquetes.peso_maximo_paquete || 'N/A'} kg</p>
                            <p className="mb-0">Costo por kg extra: ${opcion.configuracion_paquetes.costo_por_kg_extra || 'N/A'}</p>
                            <p className="mb-0">Máx. productos/paquete: {opcion.configuracion_paquetes.maximo_productos_por_paquete || 'N/A'}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Seleccione una regla para ver detalles</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {products.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5>Productos con Reglas de Envío ({products.length})</h5>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>ID</th>
                      <th>Regla Principal</th>
                      <th>Reglas (Array)</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => {
                      // Determinar si hay inconsistencias
                      const hasMainRule = !!product.shippingRuleId;
                      const hasRuleArray = product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0;
                      
                      // Verificar coherencia
                      const isConsistent = hasMainRule && hasRuleArray && product.shippingRuleId === product.shippingRuleIds[0];
                      
                      return (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td><span className="small">{product.id}</span></td>
                          <td>
                            {product.shippingRuleId ? (
                              <span 
                                className="badge bg-info"
                                onClick={() => verifyRule(product.shippingRuleId)}
                                style={{ cursor: 'pointer' }}
                              >
                                {product.shippingRuleId}
                              </span>
                            ) : (
                              <span className="badge bg-danger">No definido</span>
                            )}
                          </td>
                          <td>
                            {hasRuleArray ? (
                              <div>
                                {product.shippingRuleIds.map(ruleId => (
                                  <span 
                                    key={ruleId}
                                    className="badge bg-primary me-1 mb-1"
                                    onClick={() => verifyRule(ruleId)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {ruleId}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="badge bg-danger">No definido</span>
                            )}
                          </td>
                          <td>
                            {isConsistent ? (
                              <span className="badge bg-success">Correcto</span>
                            ) : (
                              <span className="badge bg-warning">Inconsistente</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => repairProduct(product.id)}
                              disabled={loading || isConsistent}
                            >
                              Reparar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 