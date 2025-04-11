/**
 * Shipping services index file
 * Exports all shipping-related functionality from a single entry point
 */

// Main shipping service
import { shippingService } from './ShippingService';

// Individual services
import * as ZonesService from './ShippingZonesService';
import * as RuleService from './RuleService';
import * as CombinationService from './CombinationService';

// Export the main service as default
export default shippingService;

// Export individual services and utilities
export {
  // Shipping zones
  ZonesService,
  RuleService,
  CombinationService,
  
  // Common functions
  ZonesService as ShippingZonesService,
  RuleService as ShippingRuleService
}; 