/**
 * Valores por defecto para los formularios de reglas de envío
 */

// Objeto vacío para un nuevo servicio de envío
export const EMPTY_SHIPPING_TYPE = {
  id: '',
  code: '',
  carrier: '',
  label: '',
  minDays: '',
  maxDays: '',
  price: '',
  maxPackageWeight: '20',
  extraWeightCost: '10',
  maxProductsPerPackage: '10',
  coverageZones: [{
    name: 'Nacional',
    states: '',
    cities: '',
    zipCodes: ''
  }]
};

// Configuración por defecto para el form
export const DEFAULT_SHIPPING_CONFIG = {
  id: '',
  name: 'Nueva regla de envío',
  isDefault: false,
  zipCodes: [],
  allowedProductIds: [],
  shippingTypes: []
}; 