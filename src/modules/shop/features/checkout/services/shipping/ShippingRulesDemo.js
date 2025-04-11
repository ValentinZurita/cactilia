/**
 * Shipping Rules Engine Demo
 * 
 * This file demonstrates how to use the shipping rules engine with sample data.
 */

import { findBestShippingOptions } from './ShippingRulesEngine';

// Example cart items
const sampleCart = [
  {
    id: 'prod1',
    product: {
      id: 'prod1',
      name: 'Product 1',
      price: 500,
      weight: 2.5,
      shippingRuleIds: ['rule_nacional', 'rule_local_tabasco']
    },
    quantity: 1
  },
  {
    id: 'prod2',
    product: {
      id: 'prod2',
      name: 'Product 2',
      price: 1200,
      weight: 1.0,
      shippingRuleIds: ['rule_nacional', 'rule_local_cdmx']
    },
    quantity: 2
  },
  {
    id: 'prod3',
    product: {
      id: 'prod3',
      name: 'Product 3',
      price: 799,
      weight: 0.5,
      shippingRuleIds: ['rule_nacional']
    },
    quantity: 1
  }
];

// Example shipping rules
const sampleRules = {
  'rule_nacional': {
    id: 'rule_nacional',
    zona: 'Nacional',
    coverage_type: 'nacional',
    envio_gratis: false,
    envio_gratis_monto_minimo: 1500,
    costo_por_producto_extra: 50,
    maximo_productos_por_paquete: 5,
    peso_maximo_paquete: 10,
    opciones_mensajeria: [
      {
        nombre: 'Estafeta',
        label: 'Básico',
        precio: 150,
        minDays: 3,
        maxDays: 5,
        configuracion_paquetes: {
          costo_por_kg_extra: 30,
          maximo_productos_por_paquete: 5,
          peso_maximo_paquete: 10
        }
      },
      {
        nombre: 'Estafeta',
        label: 'Express',
        precio: 250,
        minDays: 1,
        maxDays: 2,
        configuracion_paquetes: {
          costo_por_kg_extra: 40,
          maximo_productos_por_paquete: 5,
          peso_maximo_paquete: 10
        }
      }
    ]
  },
  'rule_local_tabasco': {
    id: 'rule_local_tabasco',
    zona: 'Local',
    coverage_type: 'por_estado',
    coverage_values: ['Tabasco'],
    envio_gratis: true,
    costo_por_producto_extra: 0,
    maximo_productos_por_paquete: 10,
    peso_maximo_paquete: 15,
    opciones_mensajeria: [
      {
        nombre: 'Entrega Local',
        label: 'Estándar',
        precio: 0,
        minDays: 1,
        maxDays: 2,
        configuracion_paquetes: {
          costo_por_kg_extra: 0,
          maximo_productos_por_paquete: 10,
          peso_maximo_paquete: 15
        }
      }
    ]
  },
  'rule_local_cdmx': {
    id: 'rule_local_cdmx',
    zona: 'Local',
    coverage_type: 'por_estado',
    coverage_values: ['Ciudad de México', 'CDMX'],
    envio_gratis: true,
    costo_por_producto_extra: 0,
    maximo_productos_por_paquete: 10,
    peso_maximo_paquete: 15,
    opciones_mensajeria: [
      {
        nombre: 'Entrega Local',
        label: 'Estándar',
        precio: 0,
        minDays: 1,
        maxDays: 2,
        configuracion_paquetes: {
          costo_por_kg_extra: 0,
          maximo_productos_por_paquete: 10,
          peso_maximo_paquete: 15
        }
      }
    ]
  }
};

// Example addresses
const addressTabasco = {
  state: 'Tabasco',
  city: 'Villahermosa',
  zip: '86000'
};

const addressCDMX = {
  state: 'Ciudad de México',
  city: 'Coyoacán',
  zip: '04500'
};

const addressOther = {
  state: 'Jalisco',
  city: 'Guadalajara',
  zip: '44100'
};

/**
 * Runs the shipping rules demo
 */
const runShippingDemo = async () => {
  console.log('🚢 Shipping Rules Engine Demo 🚢');
  console.log('------------------------------');
  
  // Scenario 1: Shipping to Tabasco
  console.log('\n📦 Scenario 1: Shipping to Tabasco');
  console.log('------------------------------');
  const tabasco = await findBestShippingOptions(sampleCart, addressTabasco, sampleRules);
  console.log(`✅ Success: ${tabasco.success}`);
  console.log(`📊 Found ${tabasco.totalOptions} shipping options`);
  
  if (tabasco.options && tabasco.options.length > 0) {
    console.log('\n🥇 Best option:');
    const bestOption = tabasco.options[0];
    console.log(`- Name: ${bestOption.name}`);
    console.log(`- Price: $${bestOption.price}`);
    console.log(`- Delivery: ${bestOption.minDays}-${bestOption.maxDays} days`);
    console.log(`- Is free: ${bestOption.isFree ? 'Yes' : 'No'}`);
    console.log(`- Multi-package: ${bestOption.multiPackage ? 'Yes' : 'No'}`);
    
    if (bestOption.combination && bestOption.combination.options) {
      console.log('\n📋 Combination details:');
      bestOption.combination.options.forEach((option, i) => {
        console.log(`- Zone ${i+1}: ${option.zoneName}`);
        console.log(`  Carrier: ${option.carrierName} - ${option.carrierLabel}`);
        console.log(`  Price: $${option.price}`);
        console.log(`  Products: ${option.products.length}`);
      });
    }
  }
  
  // Scenario 2: Shipping to CDMX
  console.log('\n📦 Scenario 2: Shipping to CDMX');
  console.log('------------------------------');
  const cdmx = await findBestShippingOptions(sampleCart, addressCDMX, sampleRules);
  console.log(`✅ Success: ${cdmx.success}`);
  console.log(`📊 Found ${cdmx.totalOptions} shipping options`);
  
  if (cdmx.options && cdmx.options.length > 0) {
    console.log('\n🥇 Best option:');
    const bestOption = cdmx.options[0];
    console.log(`- Name: ${bestOption.name}`);
    console.log(`- Price: $${bestOption.price}`);
    console.log(`- Delivery: ${bestOption.minDays}-${bestOption.maxDays} days`);
    console.log(`- Is free: ${bestOption.isFree ? 'Yes' : 'No'}`);
    console.log(`- Multi-package: ${bestOption.multiPackage ? 'Yes' : 'No'}`);
    
    if (bestOption.combination && bestOption.combination.options) {
      console.log('\n📋 Combination details:');
      bestOption.combination.options.forEach((option, i) => {
        console.log(`- Zone ${i+1}: ${option.zoneName}`);
        console.log(`  Carrier: ${option.carrierName} - ${option.carrierLabel}`);
        console.log(`  Price: $${option.price}`);
        console.log(`  Products: ${option.products.length}`);
      });
    }
  }
  
  // Scenario 3: Shipping to Other State (Nacional only)
  console.log('\n📦 Scenario 3: Shipping to Jalisco (Nacional only)');
  console.log('------------------------------');
  const other = await findBestShippingOptions(sampleCart, addressOther, sampleRules);
  console.log(`✅ Success: ${other.success}`);
  console.log(`📊 Found ${other.totalOptions} shipping options`);
  
  if (other.options && other.options.length > 0) {
    console.log('\n🥇 Best option:');
    const bestOption = other.options[0];
    console.log(`- Name: ${bestOption.name}`);
    console.log(`- Price: $${bestOption.price}`);
    console.log(`- Delivery: ${bestOption.minDays}-${bestOption.maxDays} days`);
    console.log(`- Is free: ${bestOption.isFree ? 'Yes' : 'No'}`);
    console.log(`- Multi-package: ${bestOption.multiPackage ? 'Yes' : 'No'}`);
    
    if (bestOption.combination && bestOption.combination.options) {
      console.log('\n📋 Combination details:');
      bestOption.combination.options.forEach((option, i) => {
        console.log(`- Zone ${i+1}: ${option.zoneName}`);
        console.log(`  Carrier: ${option.carrierName} - ${option.carrierLabel}`);
        console.log(`  Price: $${option.price}`);
        console.log(`  Products: ${option.products.length}`);
      });
    }
  }
};

// Export the demo function
export default runShippingDemo; 