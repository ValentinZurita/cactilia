/**
 * Script para reparar y diagnosticar reglas de envío de productos
 * 
 * Este script permite:
 * 1. Reparar un producto específico asignándole la regla de envío nacional
 * 2. Encontrar y reparar todos los productos con problemas de reglas de envío
 * 
 * Para usar este script:
 * 1. Abre la consola del navegador en la tienda
 * 2. Copia y pega este código
 * 3. Ejecuta fixProductShippingRules('ID_DEL_PRODUCTO') o fixAllProductsShippingRules()
 */

// ID de la regla de envío nacional por defecto
const DEFAULT_SHIPPING_RULE_ID = 'bmtunCl4oav9BbzlMihE';

/**
 * Repara las reglas de envío de un producto específico
 * @param {string} productId - ID del producto a reparar
 */
async function fixProductShippingRules(productId) {
  if (!productId) {
    console.error('❌ Debes proporcionar un ID de producto válido');
    return;
  }

  console.log(`🔍 Buscando producto con ID: ${productId}`);
  
  try {
    // Obtener referencia a Firestore
    const db = firebase.firestore();
    
    // Obtener el producto
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      console.error(`❌ El producto con ID ${productId} no existe`);
      return;
    }
    
    const productData = productDoc.data();
    console.log(`✅ Producto encontrado: ${productData.name}`);
    console.log('📊 Datos actuales:', {
      id: productId,
      name: productData.name,
      shippingRuleId: productData.shippingRuleId || 'No definido',
      shippingRuleIds: productData.shippingRuleIds || 'No definido',
      tieneReglasArray: !!productData.shippingRuleIds && Array.isArray(productData.shippingRuleIds),
      cantidadReglas: productData.shippingRuleIds && Array.isArray(productData.shippingRuleIds) ? productData.shippingRuleIds.length : 0
    });
    
    // Normalizar datos de reglas de envío
    const updates = {};
    let shouldUpdate = false;
    
    // Caso 1: No tiene array pero sí tiene ID
    if ((!productData.shippingRuleIds || !Array.isArray(productData.shippingRuleIds) || productData.shippingRuleIds.length === 0) && 
        productData.shippingRuleId && typeof productData.shippingRuleId === 'string') {
      console.log(`🔄 El producto tiene shippingRuleId pero no tiene array shippingRuleIds. Creando array...`);
      updates.shippingRuleIds = [productData.shippingRuleId];
      shouldUpdate = true;
    }
    // Caso 2: Tiene array pero no tiene ID o está vacío
    else if (productData.shippingRuleIds && Array.isArray(productData.shippingRuleIds) && productData.shippingRuleIds.length > 0 &&
             (!productData.shippingRuleId || productData.shippingRuleId !== productData.shippingRuleIds[0])) {
      console.log(`🔄 El producto tiene array shippingRuleIds pero no tiene shippingRuleId correcto. Actualizando...`);
      updates.shippingRuleId = productData.shippingRuleIds[0];
      shouldUpdate = true;
    }
    // Caso 3: No tiene ni array ni ID
    else if ((!productData.shippingRuleIds || !Array.isArray(productData.shippingRuleIds) || productData.shippingRuleIds.length === 0) &&
             (!productData.shippingRuleId || productData.shippingRuleId.trim() === '')) {
      console.log(`🔄 El producto no tiene reglas de envío. Asignando regla nacional por defecto...`);
      updates.shippingRuleId = DEFAULT_SHIPPING_RULE_ID;
      updates.shippingRuleIds = [DEFAULT_SHIPPING_RULE_ID];
      shouldUpdate = true;
    }
    
    if (shouldUpdate) {
      // Confirmar antes de actualizar
      if (confirm(`¿Quieres actualizar el producto "${productData.name}" con estas reglas de envío?\n${JSON.stringify(updates, null, 2)}`)) {
        await productRef.update(updates);
        console.log(`✅ Producto "${productData.name}" actualizado correctamente con las siguientes reglas:`, updates);
        
        // Volver a cargar para verificar
        const updatedDoc = await productRef.get();
        console.log('📊 Datos actualizados:', {
          id: productId,
          name: updatedDoc.data().name,
          shippingRuleId: updatedDoc.data().shippingRuleId || 'No definido',
          shippingRuleIds: updatedDoc.data().shippingRuleIds || 'No definido'
        });
      } else {
        console.log('❌ Actualización cancelada por el usuario');
      }
    } else {
      console.log('✅ El producto ya tiene las reglas de envío correctamente configuradas');
    }
  } catch (error) {
    console.error('❌ Error al reparar el producto:', error);
  }
}

/**
 * Encuentra y repara todos los productos con problemas de reglas de envío
 */
async function fixAllProductsShippingRules() {
  try {
    console.log('🔍 Buscando productos con problemas de reglas de envío...');
    
    // Obtener referencia a Firestore
    const db = firebase.firestore();
    
    // Obtener todos los productos
    const productsSnapshot = await db.collection('products').get();
    
    if (productsSnapshot.empty) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    console.log(`📋 Encontrados ${productsSnapshot.size} productos en total`);
    
    // Analizar productos con problemas
    const productsWithIssues = [];
    
    productsSnapshot.forEach(doc => {
      const product = {
        id: doc.id,
        ...doc.data()
      };
      
      // Detectar problemas
      const hasRuleId = !!product.shippingRuleId && product.shippingRuleId.trim() !== '';
      const hasRuleIdsArray = !!product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0;
      
      // Tiene ID pero no array, o tiene array pero no ID, o no tiene ninguno
      if ((hasRuleId && !hasRuleIdsArray) || 
          (hasRuleIdsArray && (!hasRuleId || product.shippingRuleId !== product.shippingRuleIds[0])) ||
          (!hasRuleId && !hasRuleIdsArray)) {
        productsWithIssues.push(product);
      }
    });
    
    if (productsWithIssues.length === 0) {
      console.log('✅ No se encontraron productos con problemas de reglas de envío');
      return;
    }
    
    console.log(`⚠️ Se encontraron ${productsWithIssues.length} productos con problemas de reglas de envío:`);
    
    // Mostrar lista de productos con problemas
    productsWithIssues.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.id})`, {
        shippingRuleId: product.shippingRuleId || 'No definido',
        shippingRuleIds: product.shippingRuleIds || 'No definido'
      });
    });
    
    // Confirmar reparación
    if (confirm(`¿Quieres reparar los ${productsWithIssues.length} productos con problemas de reglas de envío?`)) {
      console.log('🔧 Iniciando reparación...');
      
      let repaired = 0;
      
      for (const product of productsWithIssues) {
        const productRef = db.collection('products').doc(product.id);
        const updates = {};
        
        // Caso 1: No tiene array pero sí tiene ID
        if (product.shippingRuleId && typeof product.shippingRuleId === 'string' && 
            (!product.shippingRuleIds || !Array.isArray(product.shippingRuleIds) || product.shippingRuleIds.length === 0)) {
          updates.shippingRuleIds = [product.shippingRuleId];
        }
        // Caso 2: Tiene array pero no tiene ID o está incorrecto
        else if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0 &&
                (!product.shippingRuleId || product.shippingRuleId !== product.shippingRuleIds[0])) {
          updates.shippingRuleId = product.shippingRuleIds[0];
        }
        // Caso 3: No tiene ni array ni ID
        else if ((!product.shippingRuleIds || !Array.isArray(product.shippingRuleIds) || product.shippingRuleIds.length === 0) &&
                (!product.shippingRuleId || product.shippingRuleId.trim() === '')) {
          updates.shippingRuleId = DEFAULT_SHIPPING_RULE_ID;
          updates.shippingRuleIds = [DEFAULT_SHIPPING_RULE_ID];
        }
        
        // Actualizar producto
        await productRef.update(updates);
        console.log(`✅ Reparado: ${product.name} (${product.id})`, updates);
        repaired++;
      }
      
      console.log(`🎉 Reparación completada. ${repaired} productos actualizados correctamente.`);
    } else {
      console.log('❌ Reparación cancelada por el usuario');
    }
  } catch (error) {
    console.error('❌ Error al reparar productos:', error);
  }
}

// Exponer funciones globalmente
window.fixProductShippingRules = fixProductShippingRules;
window.fixAllProductsShippingRules = fixAllProductsShippingRules;

console.log(`
✨ Script de reparación de reglas de envío cargado correctamente ✨
Para utilizarlo:
1. fixProductShippingRules('ID_DEL_PRODUCTO') - Repara un producto específico
2. fixAllProductsShippingRules() - Repara todos los productos con problemas
`); 