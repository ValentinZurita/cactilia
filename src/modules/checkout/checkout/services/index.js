/**
 * Servicios de checkout centralizados
 * Todos los servicios relacionados con envíos han sido movidos a ./shipping/
 */

export * from '../../services/addressService.js'
export * from '../../services/checkoutService.js'

// Export shipping service
export * from './shipping/index.js'