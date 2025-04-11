/**
 * Test Script for Shipping Rules Engine
 * 
 * Run this script with Node.js to test the shipping rules engine:
 * node test-shipping-rules.js
 */

// Import the shipping demo
const runShippingDemo = require('./src/modules/shop/features/checkout/services/shipping/ShippingRulesDemo').default;

// Run the demo
runShippingDemo()
  .then(() => {
    console.log('\n✅ Demo completed successfully!');
  })
  .catch(error => {
    console.error('\n❌ Error running demo:', error);
  }); 