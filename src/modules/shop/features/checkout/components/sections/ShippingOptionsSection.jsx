import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { SectionTitle } from '../ui/SectionTitle';
import ShippingSelector from '../shipping/ShippingSelector';
import { useCart } from '../../../cart/hooks/useCart';
import { allProductsCovered } from '../../services/shipping/RuleService';

/**
 * Sección del checkout que muestra las opciones de envío disponibles
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {Function} props.onOptionSelect - Función para seleccionar una opción
 * @param {boolean} props.loading - Indica si están cargando las opciones
 * @param {boolean} props.addressSelected - Indica si ya se seleccionó una dirección
 * @param {string} props.selectedAddressType - Tipo de dirección seleccionada ('saved' o 'new')
 * @param {Object} props.newAddressData - Datos de la dirección nueva (si aplica)
 * @param {Object} props.savedAddressData - Datos de la dirección guardada (si aplica)
 * @param {string} props.error - Mensaje de error (si aplica)
 * @param {Function} props.onCombinationsCalculated - Función llamada cuando se calculan las combinaciones
 * @param {Array} props.shippingOptions - Opciones de envío precalculadas (opcional)
 */
export const ShippingOptionsSection = ({
  selectedOptionId,
  onOptionSelect,
  loading = false,
  addressSelected = false,
  selectedAddressType = 'saved',
  newAddressData = null,
  savedAddressData = null,
  error = null,
  onCombinationsCalculated,
  shippingOptions = []
}) => {
  // Obtener productos del carrito
  const { items: cartItems } = useCart();
  // Estado para controlar si todos los productos están cubiertos
  const [shippingCoversAllProducts, setShippingCoversAllProducts] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [noValidOptionsError, setNoValidOptionsError] = useState(null);
  
  // Verificar si los cartItems están disponibles
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      console.warn('⚠️ No hay productos en el carrito en ShippingOptionsSection');
    } else {
      console.log(`✅ ShippingOptionsSection: ${cartItems.length} productos en carrito`);
    }
  }, [cartItems]);

  // Verificar si hay opciones de envío disponibles
  useEffect(() => {
    if (shippingOptions && shippingOptions.length > 0) {
      console.log(`✅ ShippingOptionsSection: ${shippingOptions.length} opciones de envío disponibles`);
      setNoValidOptionsError(null);
    }
  }, [shippingOptions]);
  
  // Manejar la selección de opción
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Verificar si esta opción cubre todos los productos
    let covered = true;
    
    // Para opciones de nuestro nuevo servicio
    if (option && option.combination && option.combination.options) {
      covered = allProductsCovered(option.combination.options, cartItems);
    }
    // Para opciones del sistema original
    else if (option && (option.productIds || option.covered_products)) {
      covered = allProductsCovered([option], cartItems);
    }
    // Selecciones explícitas
    else if (option && option.selections) {
      covered = allProductsCovered(option.selections, cartItems);
    }
    
    setShippingCoversAllProducts(covered);
    
    console.log(`📦 ShippingOptionsSection: Opción seleccionada ${option.id || option.optionId}`);
    console.log(`📦 ¿Cubre todos los productos?: ${covered ? 'SÍ' : 'NO'}`);
    console.log(`💲 Precio de envío: $${option.price?.toFixed(2) || '0.00'}, Es gratis: ${option.price === 0 ? 'SÍ' : 'NO'}`);
    
    // Enriquecemos la información de la opción para mejor manejo en el checkout
    const enrichedOption = {
      ...option,
      shipping_cost: option.price || 0,
      shipping_cost_formatted: `$${(option.price || 0).toFixed(2)}`,
      shipping_method: option.name || option.carrier || 'Opción de envío',
      shipping_description: option.description || '',
      coversAllProducts: covered
    };
    
    // Llamar al callback original
    onOptionSelect(enrichedOption);
  };
  
  // Manejar el caso de que no haya opciones de envío válidas
  const handleCombinationsCalculated = (combinations) => {
    if (!combinations || combinations.length === 0) {
      setNoValidOptionsError('No encontramos opciones de envío que cubran todos tus productos. Por favor, intenta con otra dirección.');
    } else {
      setNoValidOptionsError(null);
    }
    
    // Pasar las combinaciones al callback original
    if (onCombinationsCalculated) {
      onCombinationsCalculated(combinations);
    }
  };
  
  // Obtener la dirección apropiada según el tipo
  const userAddress = selectedAddressType === 'saved' ? savedAddressData : newAddressData;
  
  // Log para depuración de dirección
  useEffect(() => {
    console.log('🏠 ShippingOptionsSection - Dirección para envío:', userAddress);
    console.log('🏠 ShippingOptionsSection - Tipo de dirección:', selectedAddressType);
    
    if (!userAddress) {
      console.warn('⚠️ No hay dirección seleccionada para cálculo de envíos');
    } else if (!userAddress.zip && !userAddress.zipcode) {
      console.warn('⚠️ La dirección no tiene código postal, puede afectar cálculo de envíos');
    }
  }, [userAddress, selectedAddressType]);
  
  // Referencia para controlar logs únicos
  const loggedRef = useRef(false);
  
  // Log para depuración inicial
  useEffect(() => {
    if (!loggedRef.current) {
      console.log('📦 Inicializando ShippingOptionsSection con:', { 
        addressSelected, 
        selectedAddressType,
        hasUserAddress: !!userAddress,
        zip: userAddress?.zip || userAddress?.zipcode || 'ninguno'
      });
      loggedRef.current = true;
    }
  }, [addressSelected, selectedAddressType, userAddress]);
  
  // Verificar mínimos necesarios
  if (!addressSelected || !userAddress) {
    return (
      <div className="checkout-section mb-4">
        <SectionTitle
          number="2"
          title="Opciones de envío"
          subtitle="Por favor, seleccione una dirección de envío primero"
          icon="bi-truck"
        />
        <div className="checkout-section-content p-3 p-md-4 bg-white rounded border">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Para calcular opciones de envío, primero debe seleccionar una dirección.
          </div>
        </div>
      </div>
    );
  }
  
  // Verificar código postal
  if (!userAddress.zip && !userAddress.zipcode) {
    return (
      <div className="checkout-section mb-4">
        <SectionTitle
          number="2"
          title="Opciones de envío"
          subtitle="Se requiere código postal para calcular envío"
          icon="bi-truck"
        />
        <div className="checkout-section-content p-3 p-md-4 bg-white rounded border">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            La dirección seleccionada no tiene un código postal válido.
            Por favor, actualice la dirección o seleccione otra.
          </div>
        </div>
      </div>
    );
  }
  
  // Mostrar error específico si existe
  if (error || noValidOptionsError) {
    const displayError = error || noValidOptionsError;
    
    return (
      <div className="checkout-section mb-4">
        <SectionTitle
          number="2"
          title="Opciones de envío"
          subtitle="Error al calcular opciones"
          icon="bi-truck"
        />
        <div className="checkout-section-content p-3 p-md-4 bg-white rounded border">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {displayError}
          </div>
          {noValidOptionsError && (
            <div className="mt-3 p-3 border rounded bg-light">
              <h5 className="mb-3"><i className="bi bi-info-circle me-2"></i>¿Por qué sucede esto?</h5>
              <p>Algunos productos en tu carrito tienen diferentes reglas de envío y la dirección seleccionada no es compatible con todas ellas.</p>
              <p>Puedes intentar lo siguiente:</p>
              <ul>
                <li>Seleccionar una dirección en otra zona</li>
                <li>Contactar a soporte para asistencia</li>
                <li>Comprar los productos en pedidos separados</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-section mb-4">
      <SectionTitle
        number="2"
        title="Opciones de envío"
        subtitle={loading ? "Calculando opciones disponibles..." : "Seleccione una opción para el envío de sus productos"}
        icon="bi-truck"
      />
      <div className="checkout-section-content p-3 p-md-4 bg-white rounded border">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-4">
            <div className="spinner-border text-success mb-3" role="status" style={{ width: '2rem', height: '2rem', borderWidth: '0.2em' }}>
              <span className="visually-hidden">Cargando opciones de envío...</span>
            </div>
            <div className="text-muted">Calculando opciones de envío...</div>
          </div>
        ) : (
          <>
            <ShippingSelector
              cartItems={cartItems}
              selectedOptionId={selectedOptionId}
              onOptionSelect={handleOptionSelect}
              userAddress={userAddress}
              onCombinationsCalculated={handleCombinationsCalculated}
              shippingOptions={shippingOptions}
            />
            
            {selectedOption && !shippingCoversAllProducts && (
              <div className="alert alert-danger mt-3">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                <strong>No se puede proceder con el pago</strong>: La opción de envío seleccionada no cubre todos los productos.
                Debe seleccionar una opción que incluya todos los productos para continuar.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

ShippingOptionsSection.propTypes = {
  selectedOptionId: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  addressSelected: PropTypes.bool,
  selectedAddressType: PropTypes.string,
  newAddressData: PropTypes.object,
  savedAddressData: PropTypes.object,
  error: PropTypes.string,
  onCombinationsCalculated: PropTypes.func,
  shippingOptions: PropTypes.array
};

export default ShippingOptionsSection; 