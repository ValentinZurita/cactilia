import React from 'react';
import PropTypes from 'prop-types';
import { SectionTitle } from '../ui/SectionTitle';
import ShippingOptionSelector from '../shipping/ShippingOptionSelector';

/**
 * Sección del checkout que muestra las opciones de envío disponibles
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.shippingOptions - Lista de opciones de envío disponibles
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {Function} props.onOptionSelect - Función para seleccionar una opción
 * @param {boolean} props.loading - Indica si están cargando las opciones
 * @param {boolean} props.addressSelected - Indica si ya se seleccionó una dirección
 */
export const ShippingOptionsSection = ({
  shippingOptions = [],
  selectedOptionId,
  onOptionSelect,
  loading = false,
  addressSelected = false
}) => {
  // Si no hay dirección seleccionada, mostrar mensaje
  if (!addressSelected) {
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

  return (
    <div className="checkout-section mb-4">
      <SectionTitle
        number="2"
        title="Opciones de envío"
        subtitle="Selecciona una opción de envío para tu pedido"
        icon="bi-truck"
      />
      <div className="checkout-section-content p-4 bg-light rounded">
        {/* Verificamos si hay opciones disponibles */}
        {!loading && shippingOptions.length === 0 ? (
          <div className="alert alert-warning mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            No hay opciones de envío disponibles para la dirección seleccionada.
          </div>
        ) : (
          <ShippingOptionSelector
            shippingOptions={shippingOptions}
            selectedOptionId={selectedOptionId}
            onOptionSelect={onOptionSelect}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

ShippingOptionsSection.propTypes = {
  shippingOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      carrier: PropTypes.string,
      calculatedCost: PropTypes.number,
      totalCost: PropTypes.number,
      minDays: PropTypes.number,
      maxDays: PropTypes.number,
      details: PropTypes.string
    })
  ),
  selectedOptionId: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  addressSelected: PropTypes.bool
};

export default ShippingOptionsSection; 