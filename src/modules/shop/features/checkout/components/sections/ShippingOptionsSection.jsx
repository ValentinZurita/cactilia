import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SectionTitle } from '../ui/SectionTitle';
import ShippingGroupSelector from '../shipping/ShippingGroupSelector';
import { useCart } from '../../../cart/hooks/useCart';
import { processCartForShipping } from '../../../cart/services/shippingGroupService';


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
  // Referencia para controlar logs
  const loggedStatesRef = useRef({});
  
  // Obtener los items del carrito
  const { items: cartItems } = useCart();
  
  // Determinar qué dirección usar
  const userAddress = selectedAddressType === 'new' ? newAddressData : savedAddressData;
  
  // Log detallado para diagnóstico de dirección
  useEffect(() => {
    console.log('🏠 Dirección para opciones de envío:', {
      tipo: selectedAddressType,
      direccion: userAddress ? JSON.stringify(userAddress).substring(0, 200) : 'No disponible',
      completa: !!userAddress,
      tieneCP: userAddress?.zipcode || userAddress?.zip || 'No',
      tieneCartItems: cartItems?.length || 0
    });
  }, [userAddress, selectedAddressType, cartItems]);
  
  // Log para diagnóstico más controlado
  useEffect(() => {
    // Crear una clave única basada en el estado actual
    const stateKey = `${selectedOptionId}-${loading}-${addressSelected}-${selectedAddressType}`;
    
    // Solo loggear si es un estado nuevo que no hemos visto antes
    if (!loggedStatesRef.current[stateKey]) {
      // Solo casos importantes: inicio, cambio de opciones, selección
      if (selectedOptionId || !loggedStatesRef.current.initialized) {
        console.log('📦 Estado de opciones de envío:', {
          seleccionada: selectedOptionId ? 'Sí' : 'No',
          tipoDir: selectedAddressType,
          direccionCompleta: addressSelected
        });
        
        // Marcar este estado como ya registrado
        loggedStatesRef.current[stateKey] = true;
        loggedStatesRef.current.initialized = true;
      }
    }
  }, [selectedOptionId, loading, addressSelected, selectedAddressType]);

  // Verificar si estamos en modo de dirección nueva y si está incompleta
  const isNewAddressIncomplete = selectedAddressType === 'new' && (
    !newAddressData || 
    !newAddressData.street || 
    !newAddressData.city || 
    !newAddressData.state || 
    !newAddressData.zip
  );

  // Si estamos en modo de dirección nueva incompleta, mostrar mensaje especial
  if (isNewAddressIncomplete) {
    return (
      <div className="checkout-section mb-4">
        <SectionTitle
          number="2"
          title="Opciones de envío"
          subtitle="Complete su dirección para ver opciones de envío"
          icon="bi-truck"
        />
        <div className="checkout-section-content p-4 bg-light rounded">
          <div className="alert alert-info mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Por favor, complete todos los campos obligatorios de la dirección para ver las opciones de envío disponibles.
          </div>
        </div>
      </div>
    );
  }

  // Si no hay dirección seleccionada (modo guardado), mostrar mensaje
  if (selectedAddressType === 'saved' && !addressSelected) {
    return (
      <div className="checkout-section mb-4">
        <SectionTitle
          number="2"
          title="Opciones de envío"
          subtitle="Selecciona una dirección primero para ver las opciones de envío disponibles"
          icon="bi-truck"
        />
        <div className="checkout-section-content p-4 bg-light rounded">
          <div className="alert alert-info mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Por favor, selecciona primero una dirección de envío para ver las opciones disponibles.
          </div>
        </div>
      </div>
    );
  }

  // Si hay un error específico, mostrarlo
  if (error) {
    return (
      <div className="checkout-section mb-4">
        <SectionTitle
          number="2"
          title="Opciones de envío"
          subtitle="Error al calcular opciones"
          icon="bi-truck"
        />
        <div className="checkout-section-content p-4 bg-light rounded">
          <div className="alert alert-warning mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
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
          <ShippingGroupSelector
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