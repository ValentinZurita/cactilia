import React, { useEffect, useState } from 'react';
import { getShippingOptions } from '../../services/shipping/ShippingService';
import './ShippingGroupSelector.css';

/**
 * Componente para seleccionar grupos de envío
 * Muestra opciones de envío agrupadas por zona y tipo
 */
const ShippingGroupSelector = ({
  cartItems,
  onOptionSelect,
  selectedOptionId,
  userAddress,
  shippingOptions = []
}) => {
  // Estado para opciones de envío agrupadas
  const [groupedOptions, setGroupedOptions] = useState([]);
  // Estado para manejo de errores
  const [error, setError] = useState(null);
  // Estado para indicar carga
  const [loading, setLoading] = useState(false);
  
  // Cargar opciones de envío al montar el componente o cambiar dirección
  useEffect(() => {
    const loadShippingOptions = async () => {
      if (!userAddress || !cartItems || cartItems.length === 0) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Si ya tenemos opciones precalculadas, las usamos
        if (shippingOptions && shippingOptions.length > 0) {
          processShippingOptions(shippingOptions);
        } else {
          // Si no, obtenemos nuevas opciones del servicio
          const options = await getShippingOptions(cartItems, userAddress);
          processShippingOptions(options);
        }
      } catch (err) {
        console.error('Error al cargar opciones de envío:', err);
        setError('No pudimos cargar las opciones de envío. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingOptions();
  }, [cartItems, userAddress, shippingOptions]);
  
  // Procesar opciones de envío para agruparlas lógicamente
  const processShippingOptions = (options) => {
    if (!options || options.length === 0) {
      setGroupedOptions([]);
      return;
    }
    
    console.log('✅ Procesando opciones de envío:', options);
    
    // Aquí agrupamos según los datos reales de las zonas
    // Usamos los tipos de cobertura y nombres reales
    
    // Primero, identificamos todos los tipos de zonas disponibles
    const zoneTypes = new Set();
    options.forEach(option => {
      if (option.type) {
        zoneTypes.add(option.type.toLowerCase());
      } else if (option.zoneName) {
        zoneTypes.add(option.zoneName.toLowerCase());
      }
    });
    
    // Luego, creamos grupos dinámicos basados en los datos
    const groups = [];
    
    // Primero mostramos las opciones fallback, si existen
    const fallbackOptions = options.filter(option => option.isFallback);
    if (fallbackOptions.length > 0) {
      groups.push({
        id: 'fallback_shipping',
        title: 'Opción de Envío',
        subtitle: 'Esta opción garantiza la entrega de todos tus productos',
        options: fallbackOptions,
        icon: 'bi-truck'
      });
    }
    
    // Grupo especial: opciones gratuitas que cubren todos los productos
    const freeOptions = options.filter(option => 
      !option.isFallback &&
      option.price === 0 &&
      (option.combination?.isComplete || option.coversAllProducts)
    );
    
    if (freeOptions.length > 0) {
      groups.push({
        id: 'free_shipping',
        title: 'Envío gratuito',
        subtitle: 'Todas tus compras sin costo de envío',
        options: freeOptions,
        icon: 'bi-gift'
      });
    }
    
    // Grupos por tipo de zona
    zoneTypes.forEach(zoneType => {
      // Filtrar opciones no gratuitas de este tipo y que no sean fallback
      const typeOptions = options.filter(option => {
        if (option.isFallback || (option.price === 0 && freeOptions.includes(option))) {
          return false;
        }
        
        if ((option.type && option.type.toLowerCase() === zoneType) ||
            (option.zoneName && option.zoneName.toLowerCase() === zoneType)) {
          return true;
        }
        return false;
      });
      
      // Solo añadir si hay opciones
      if (typeOptions.length > 0) {
        // Nombre bonito para el tipo de zona
        let title = '';
        let icon = '';
        let subtitle = '';
        
        if (zoneType.includes('local')) {
          title = 'Envío local';
          subtitle = 'Opciones para productos con envío en tu zona';
          icon = 'bi-pin-map';
        } else if (zoneType.includes('nacional') || zoneType.includes('national')) {
          title = 'Envío nacional';
          subtitle = 'Opciones para productos con envío a nivel nacional';
          icon = 'bi-truck';
        } else if (zoneType.includes('internacional') || zoneType.includes('international')) {
          title = 'Envío internacional';
          subtitle = 'Opciones para envío fuera del país';
          icon = 'bi-globe';
        } else {
          // Si es otro tipo que no reconocemos, usar el nombre directamente
          // Primera letra en mayúscula y resto en minúscula
          const formattedType = zoneType.charAt(0).toUpperCase() + zoneType.slice(1).toLowerCase();
          title = `Envío ${formattedType}`;
          subtitle = `Opciones de envío para servicio ${formattedType}`;
          icon = 'bi-box';
        }
        
        groups.push({
          id: `zone_${zoneType}`,
          title,
          subtitle,
          options: typeOptions,
          icon
        });
      }
    });
    
    // Grupo especial: combinaciones (opciones que usan múltiples servicios)
    const combinedOptions = options.filter(option => 
      !option.isFallback &&
      option.price > 0 && // Solo opciones no gratuitas
      (option.type === 'combined' || 
       (option.combination && option.combination.options && option.combination.options.length > 1))
    );
    
    if (combinedOptions.length > 0) {
      groups.push({
        id: 'combined_shipping',
        title: 'Combinaciones de envío',
        subtitle: 'Opciones que combinan diferentes métodos para todos tus productos',
        options: combinedOptions,
        icon: 'bi-box-seam'
      });
    }
    
    // Si no logramos agrupar nada, mostrar todas las opciones en un solo grupo
    if (groups.length === 0 && options.length > 0) {
      groups.push({
        id: 'all_options',
        title: 'Todas las opciones de envío',
        subtitle: 'Todos los métodos disponibles para tus productos',
        options: options,
        icon: 'bi-box2'
      });
    }
    
    console.log(`📊 Grupos de opciones de envío generados: ${groups.length}`);
    setGroupedOptions(groups);
  };
  
  // Renderizar opción de envío individual
  const renderShippingOption = (option) => {
    // Verificar si esta opción está seleccionada
    const isSelected = selectedOptionId === (option.id || option.optionId);
    
    // Determinar productos incluidos en esta opción
    let includedProducts = [];
    
    // Si la opción viene de nuestro servicio con combination
    if (option.combination && option.combination.options) {
      // Unir productos de todas las sub-opciones
      includedProducts = option.combination.options.flatMap(opt => 
        opt.products?.map(p => p.product?.id || p.id) || []
      );
    }
    // Si la opción tiene productos directamente
    else if (option.products) {
      includedProducts = option.products.map(p => p.product?.id || p.id);
    }
    // Si la opción tiene productIds
    else if (option.productIds) {
      includedProducts = option.productIds;
    }
    
    // Convertir duración de envío a texto legible
    const getDeliveryTimeText = () => {
      if (option.minDays && option.maxDays) {
        if (option.minDays === option.maxDays) {
          return `Entrega en ${option.minDays} día${option.minDays > 1 ? 's' : ''}`;
        }
        return `Entrega en ${option.minDays}-${option.maxDays} días`;
      }
      
      if (option.estimatedDelivery) {
        return option.estimatedDelivery;
      }
      
      return 'Tiempo de entrega variable';
    };
    
    // Determinar si esta opción utiliza múltiples paquetes
    const isMultiPackage = option.multiPackage || option.packageCount > 1;
    
    // Determinar texto para mostrar en la opción
    const getOptionDisplayName = () => {
      if (option.name) {
        return option.name;
      }
      if (option.carrier || option.carrierName) {
        return option.carrier || option.carrierName;
      }
      if (option.combination && option.combination.options && option.combination.options.length > 0) {
        return `Combinación de ${option.combination.options.length} servicios`;
      }
      return 'Opción de envío';
    };
    
    return (
      <div 
        key={option.id || option.optionId} 
        className={`shipping-option-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onOptionSelect(option)}
      >
        <div className="shipping-option-header">
          <div className="shipping-option-name">
            <i className={option.price === 0 ? 'bi bi-gift text-success' : 'bi bi-truck'}></i>
            <span className="ms-2">
              {getOptionDisplayName()}
              {option.optionName && option.name !== option.optionName && ` - ${option.optionName}`}
            </span>
            {option.price === 0 && <span className="badge bg-success ms-2">GRATIS</span>}
            {isMultiPackage && (
              <span className="badge bg-info ms-2">
                {option.packageCount || 2} paquetes
              </span>
            )}
            {option.isFallback && (
              <span className="badge bg-warning ms-2">Opción única</span>
            )}
          </div>
          <div className="shipping-option-price">
            {option.price > 0 ? 
              <span>${option.price.toFixed(2)}</span> : 
              <span className="text-success">Gratis</span>
            }
          </div>
        </div>
        
        <div className="shipping-option-details">
          <div className="shipping-option-delivery">
            <i className="bi bi-clock me-2"></i>
            <span>{getDeliveryTimeText()}</span>
          </div>
          
          {includedProducts.length > 0 && includedProducts.length < cartItems.length && (
            <div className="shipping-option-products mt-2">
              <small>
                <strong>Productos incluidos:</strong> {includedProducts.length} de {cartItems.length}
              </small>
            </div>
          )}
          
          {option.description && (
            <div className="shipping-option-description mt-2">
              <small>{option.description}</small>
            </div>
          )}
          
          {option.freeReason && (
            <div className="shipping-option-free-reason mt-2">
              <small className="text-success">
                <i className="bi bi-info-circle me-1"></i>
                {option.freeReason}
              </small>
            </div>
          )}
          
          {isMultiPackage && option.packages && option.packages.length > 0 && (
            <div className="shipping-option-packages mt-2">
              <small>
                <i className="bi bi-boxes me-1"></i>
                <strong>Detalle de paquetes:</strong>
              </small>
              <ul className="packages-list mt-1 mb-0">
                {option.packages.map((pkg, idx) => (
                  <li key={idx}>
                    Paquete {idx + 1}: {pkg.products.length} productos - 
                    {pkg.price > 0 ? ` $${pkg.price.toFixed(2)}` : ' Gratis'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="shipping-option-select">
          <div className={`form-check ${isSelected ? 'checked' : ''}`}>
            <input 
              type="radio"
              className="form-check-input" 
              checked={isSelected}
              onChange={() => onOptionSelect(option)}
              id={`shipping-option-${option.id || option.optionId}`}
            />
            <label className="form-check-label" htmlFor={`shipping-option-${option.id || option.optionId}`}>
              {isSelected ? 'Seleccionado' : 'Seleccionar'}
            </label>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar un grupo de opciones de envío
  const renderOptionGroup = (group) => {
    if (!group.options || group.options.length === 0) return null;
    
    return (
      <div key={group.id} className="shipping-option-group mb-4">
        <div className="shipping-group-header">
          <h5>
            <i className={`bi ${group.icon || 'bi-box'} me-2`}></i>
            {group.title}
          </h5>
          <p className="text-muted">{group.subtitle}</p>
        </div>
        
        <div className="shipping-options-container">
          {group.options.map(renderShippingOption)}
        </div>
      </div>
    );
  };
  
  // Si estamos cargando, mostrar spinner
  if (loading) {
    return (
      <div className="shipping-options-loading text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando opciones de envío...</span>
        </div>
        <p className="mt-3">Calculando las mejores opciones de envío para tus productos...</p>
      </div>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }
  
  // Si no hay opciones, mostrar mensaje
  if (!groupedOptions || groupedOptions.length === 0) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-circle-fill me-2"></i>
        No encontramos opciones de envío disponibles para tu dirección.
        Por favor, verifica que tu dirección sea correcta o contacta a servicio al cliente.
      </div>
    );
  }
  
  // Renderizar grupos de opciones
  return (
    <div className="shipping-groups-container">
      {groupedOptions.map(renderOptionGroup)}
    </div>
  );
};

export default ShippingGroupSelector; 