import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SectionTitle } from '../ui/SectionTitle';
import ShippingSelector from '../shipping/ShippingSelector';
import { useCart } from '../../../cart/hooks/useCart';

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
  onCombinationsCalculated
}) => {
  // Obtener productos del carrito
  const { items: cartItems } = useCart();
  
  // Verificar si los cartItems están disponibles
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      console.warn('⚠️ No hay productos en el carrito en ShippingOptionsSection');
    } else {
      console.log(`✅ ShippingOptionsSection: ${cartItems.length} productos en carrito`);
    }
  }, [cartItems]);
  
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
  if (error) {
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
            {error}
          </div>
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
          <ShippingSelector
            cartItems={cartItems}
            selectedOptionId={selectedOptionId}
            onOptionSelect={onOptionSelect}
            userAddress={userAddress}
            onCombinationsCalculated={onCombinationsCalculated}
          />
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
  onCombinationsCalculated: PropTypes.func
};

export default ShippingOptionsSection; 