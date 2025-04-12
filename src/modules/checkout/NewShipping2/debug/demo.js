/**
 * SHIPPING DEBUG DEMO
 * 
 * This file demonstrates how to use the shipping debug tools programmatically.
 * Run this in the browser console when on the checkout page to test shipping rules.
 */

// Import debug utilities - when using in console, these are already available
// const { directCheck, testRulesForAddress, hasNacionalCoverage } = require('./directChecker');
// const { debugIsRuleValidForAddress } = require('./debug-address');

/**
 * Demo 1: Test the current address against all shipping rules
 * This shows how to access the current address and rules from the page
 */
function demoCurrentAddressTest() {
  console.group('🚢 SHIPPING DEBUG DEMO - Current Address');
  
  // Get shipping data from the page's React context
  const shippingData = window.getShippingData(); // This function must be defined elsewhere
  
  // Or directly access from debug localStorage if available
  const debugData = JSON.parse(localStorage.getItem('shippingDebugData') || '{}');
  const address = debugData.address || {};
  const rules = debugData.rules || [];
  
  if (!address || Object.keys(address).length === 0) {
    console.error('❌ No address found. Please select an address in checkout first.');
    console.groupEnd();
    return;
  }
  
  if (!rules || rules.length === 0) {
    console.error('❌ No shipping rules found.');
    console.groupEnd();
    return;
  }
  
  console.log('📍 Testing address:', address);
  console.log(`Found ${rules.length} shipping rules to test`);
  
  // Test rules using directChecker
  const results = testRulesForAddress(rules, address);
  
  // Display results
  const validRules = results.filter(r => r.valid);
  const invalidRules = results.filter(r => !r.valid);
  
  console.log(`✅ Valid rules: ${validRules.length}`);
  console.log(`❌ Invalid rules: ${invalidRules.length}`);
  
  // Check if any nacional rules exist and are valid
  const nacionalRules = rules.filter(r => hasNacionalCoverage(r));
  const validNacionalRules = nacionalRules.filter(r => 
    validRules.some(vr => vr.ruleId === r.id)
  );
  
  console.log(`🌎 Nacional rules: ${nacionalRules.length}`);
  console.log(`✅ Valid nacional rules: ${validNacionalRules.length}`);
  
  if (nacionalRules.length > 0 && validNacionalRules.length === 0) {
    console.warn('⚠️ Nacional rules exist but none are valid for this address!');
    
    // Debug first nacional rule
    if (nacionalRules.length > 0) {
      const firstNacionalRule = nacionalRules[0];
      console.log('Debugging first nacional rule:', firstNacionalRule);
      const debugResult = debugIsRuleValidForAddress(firstNacionalRule, address);
      console.log('Debug result:', debugResult);
    }
  }
  
  console.groupEnd();
  return results;
}

/**
 * Demo 2: Test a specific rule against the current address
 */
function demoTestSpecificRule(ruleId) {
  console.group(`🚢 SHIPPING DEBUG DEMO - Test Rule #${ruleId}`);
  
  // Get data from localStorage if available
  const debugData = JSON.parse(localStorage.getItem('shippingDebugData') || '{}');
  const address = debugData.address || {};
  const rules = debugData.rules || [];
  
  const rule = rules.find(r => r.id === ruleId);
  
  if (!rule) {
    console.error(`❌ Rule #${ruleId} not found.`);
    console.groupEnd();
    return;
  }
  
  console.log('🔍 Testing rule:', rule);
  
  const result = directCheck(rule, address);
  console.log(`Rule valid: ${result.valid ? '✅ YES' : '❌ NO'}`);
  console.log('Validation details:', result);
  
  console.groupEnd();
  return result;
}

/**
 * Demo 3: Test all rules that have "nacional" coverage
 */
function demoTestNacionalRules() {
  console.group('🚢 SHIPPING DEBUG DEMO - Nacional Rules');
  
  // Get data from localStorage if available
  const debugData = JSON.parse(localStorage.getItem('shippingDebugData') || '{}');
  const address = debugData.address || {};
  const rules = debugData.rules || [];
  
  const nacionalRules = rules.filter(r => hasNacionalCoverage(r));
  
  if (nacionalRules.length === 0) {
    console.log('❌ No rules with "nacional" coverage found.');
    console.groupEnd();
    return;
  }
  
  console.log(`Found ${nacionalRules.length} rules with "nacional" coverage`);
  
  // Test each nacional rule
  const results = nacionalRules.map(rule => {
    const result = directCheck(rule, address);
    
    console.log(`Rule #${rule.id}: ${result.valid ? '✅ valid' : '❌ invalid'}`);
    if (!result.valid) {
      console.log('  Reason:', result.message || 'Unknown');
    }
    
    return { rule, result };
  });
  
  const validCount = results.filter(r => r.result.valid).length;
  
  console.log(`✅ Valid nacional rules: ${validCount}/${nacionalRules.length}`);
  
  console.groupEnd();
  return results;
}

// Export functions for use in console
window.shippingDebugDemo = {
  testCurrentAddress: demoCurrentAddressTest,
  testRule: demoTestSpecificRule,
  testNacionalRules: demoTestNacionalRules
};

console.log('🚢 Shipping Debug Demo loaded! Run one of these commands:');
console.log('- window.shippingDebugDemo.testCurrentAddress()');
console.log('- window.shippingDebugDemo.testRule(ruleId)');
console.log('- window.shippingDebugDemo.testNacionalRules()');

// Auto-run the current address test if in debug mode
if (localStorage.getItem('debugMode') === 'true') {
  demoCurrentAddressTest();
} 