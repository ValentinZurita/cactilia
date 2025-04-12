import React, { lazy, Suspense } from 'react';
import Spinner from '../components/common/Spinner';

// Lazy loading de componentes pesados
const ShippingSelector = lazy(() => import('../components/shipping/ShippingSelector'));
const ShippingGroupSelector = lazy(() => import('../components/shipping/ShippingGroupSelector'));

/**
 * Feature que maneja las opciones de envío con carga diferida
 * Implementa lazy loading para mejorar el rendimiento inicial de la página
 */
const ShippingOptionsFeature = ({ 
  shippingGroups = [], 
  selectedOptionId, 
  onOptionSelect, 
  loading = false, 
  userAddress = null,
  hasError = false,
  errorMessage = '',
  cartItems = []
}) => {
  // Determinar qué componente renderizar basado en los grupos
  const showGroupSelector = shippingGroups && shippingGroups.length > 1;
  
  return (
    <div className="shipping-options-feature">
      <Suspense fallback={<div className="shimmer-container p-4 rounded"><Spinner /></div>}>
        {showGroupSelector ? (
          <ShippingGroupSelector 
            groups={shippingGroups}
            selectedOptionId={selectedOptionId}
            onOptionSelect={onOptionSelect}
            loading={loading}
          />
        ) : (
          <ShippingSelector
            cartItems={cartItems}
            selectedOptionId={selectedOptionId}
            onOptionSelect={onOptionSelect}
            userAddress={userAddress}
            isLoading={loading}
            error={hasError ? errorMessage : null}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ShippingOptionsFeature; 