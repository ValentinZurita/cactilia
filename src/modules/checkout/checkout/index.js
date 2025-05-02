// Componentes de checkout
export { default as CheckoutFeature } from './features/CheckoutFeature'
export { default as ShippingOptionsFeature } from '../components/shipping/ShippingOptionsFeature.jsx'

// Componentes UI
export { CheckoutContent } from '@modules/checkout/components/summary/CheckoutContent.jsx'
export { CheckoutForm } from '@modules/checkout/components/summary/CheckoutForm.jsx'
export { CheckoutSummaryPanel } from '@modules/checkout/components/summary/CheckoutSummaryPanel.jsx'

// Hooks
export { useCheckout } from '../hooks/useCheckout.js'
export { useShippingOptions2 } from '@modules/checkout/hooks/useShippingOptions2.js'
export { useShippingGroups } from '@modules/checkout/hooks/useShippingGroups.js'

// Re-exportar para centralizar acceso
export * from '@modules/checkout/components/shipping/index.js'