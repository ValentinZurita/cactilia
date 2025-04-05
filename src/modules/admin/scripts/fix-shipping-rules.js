/**
 * Script para reparar las reglas de envío de un producto específico
 * Para usar en la consola del navegador.
 */

const fixProductShippingRules = async (productId) => {
  if (!productId) {
    console.error('Debe proporcionar un ID de producto');
    return;
  }
  
  try {
    // Importaciones necesarias de Firebase
    const { getFirestore, doc, getDoc, updateDoc } = firebase.firestore;
    const db = getFirestore();
    
    // Obtener el producto
    console.log(`Buscando producto con ID: ${productId}`);
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      console.error(`Producto con ID ${productId} no encontrado`);
      return;
    }
    
    const productData = productSnap.data();
    console.log('Datos actuales del producto:', {
      name: productData.name,
      shippingRuleId: productData.shippingRuleId,
      shippingRuleIds: productData.shippingRuleIds
    });
    
    // Crear objeto de actualización limpio
    const updateData = {};
    
    // Normalizar reglas de envío
    if (productData.shippingRuleIds && Array.isArray(productData.shippingRuleIds) && productData.shippingRuleIds.length > 0) {
      // Filtrar IDs inválidos
      const validRuleIds = productData.shippingRuleIds.filter(id => id && typeof id === 'string' && id.trim() !== '');
      
      if (validRuleIds.length > 0) {
        updateData.shippingRuleIds = validRuleIds;
        updateData.shippingRuleId = validRuleIds[0];
        console.log(`Usando ${validRuleIds.length} reglas válidas del array existente`);
      } else {
        console.warn('No se encontraron reglas válidas en el array');
        // Si no hay reglas válidas, hay que asignar alguna
        // Esto dependerá de tu lógica de negocio
      }
    } 
    else if (productData.shippingRuleId && typeof productData.shippingRuleId === 'string' && productData.shippingRuleId.trim() !== '') {
      // Si solo tiene shippingRuleId, crear el array
      updateData.shippingRuleIds = [productData.shippingRuleId];
      updateData.shippingRuleId = productData.shippingRuleId;
      console.log(`Creando array a partir de regla única: ${productData.shippingRuleId}`);
    }
    else {
      console.error('El producto no tiene reglas de envío válidas, no se puede reparar automáticamente');
      // Aquí podrías asignar una regla por defecto si lo deseas
      return;
    }
    
    // Eliminar campos problemáticos que causan errores
    updateData.shippingRulesInfo = null; // Firebase eliminará el campo si se establece a null
    updateData.shippingRuleInfo = null;
    
    console.log('Datos de actualización:', updateData);
    
    // Confirmar antes de actualizar
    const confirmation = confirm(`¿Deseas actualizar el producto "${productData.name}" con las siguientes reglas de envío: ${updateData.shippingRuleIds.join(', ')}?`);
    
    if (!confirmation) {
      console.log('Operación cancelada por el usuario');
      return;
    }
    
    // Actualizar el producto
    await updateDoc(productRef, updateData);
    console.log(`✅ Producto ${productId} (${productData.name}) actualizado correctamente`);
    
    // Verificar que se haya actualizado correctamente
    const updatedSnap = await getDoc(productRef);
    const updatedData = updatedSnap.data();
    
    console.log('Datos actualizados:', {
      name: updatedData.name,
      shippingRuleId: updatedData.shippingRuleId,
      shippingRuleIds: updatedData.shippingRuleIds,
      tieneShippingRulesInfo: !!updatedData.shippingRulesInfo,
      tieneShippingRuleInfo: !!updatedData.shippingRuleInfo
    });
    
  } catch (error) {
    console.error('Error al reparar producto:', error);
  }
};

// Ejemplo de uso: fixProductShippingRules('e9lK7PMv83TCwSwngDDi')

/**
 * Función para reparar todos los productos que tienen problemas con reglas de envío
 */
const fixAllProductsShippingRules = async () => {
  try {
    // Importaciones necesarias de Firebase
    const { getFirestore, collection, query, getDocs, doc, updateDoc } = firebase.firestore;
    const db = getFirestore();
    
    // Obtener todos los productos
    console.log('Buscando productos con problemas de reglas de envío...');
    const productsRef = collection(db, 'products');
    const productsSnap = await getDocs(productsRef);
    
    const productsToFix = [];
    
    // Identificar productos con problemas
    productsSnap.forEach(docSnap => {
      const data = docSnap.data();
      
      // Verificar si hay inconsistencias en las reglas de envío
      const hasMainRule = !!data.shippingRuleId;
      const hasRuleArray = data.shippingRuleIds && Array.isArray(data.shippingRuleIds) && data.shippingRuleIds.length > 0;
      
      // Caso 1: Tiene ID pero no array
      const case1 = hasMainRule && !hasRuleArray;
      
      // Caso 2: Tiene array pero no ID
      const case2 = !hasMainRule && hasRuleArray;
      
      // Caso 3: ID no coincide con primer elemento del array
      const case3 = hasMainRule && hasRuleArray && data.shippingRuleId !== data.shippingRuleIds[0];
      
      // Caso 4: Tiene shippingRulesInfo o shippingRuleInfo que pueden causar errores
      const case4 = data.shippingRulesInfo !== undefined || data.shippingRuleInfo !== undefined;
      
      if (case1 || case2 || case3 || case4) {
        productsToFix.push({
          id: docSnap.id,
          ...data,
          issues: {
            case1, case2, case3, case4
          }
        });
      }
    });
    
    console.log(`Se encontraron ${productsToFix.length} productos con problemas`);
    
    if (productsToFix.length === 0) {
      console.log('No hay productos que reparar');
      return;
    }
    
    // Mostrar productos con problemas
    console.table(productsToFix.map(p => ({
      id: p.id,
      name: p.name,
      shippingRuleId: p.shippingRuleId,
      shippingRuleIds: p.shippingRuleIds,
      issues: Object.entries(p.issues)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ')
    })));
    
    // Confirmar antes de continuar
    const confirmation = confirm(`¿Deseas reparar ${productsToFix.length} productos con problemas de reglas de envío?`);
    
    if (!confirmation) {
      console.log('Operación cancelada por el usuario');
      return;
    }
    
    // Reparar cada producto
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of productsToFix) {
      try {
        const updateData = {};
        
        // Normalizar reglas de envío según el caso
        if (product.issues.case1) {
          // Caso 1: Tiene ID pero no array - crear array
          updateData.shippingRuleIds = [product.shippingRuleId];
        }
        else if (product.issues.case2) {
          // Caso 2: Tiene array pero no ID - poner primer elemento como ID
          updateData.shippingRuleId = product.shippingRuleIds[0];
        }
        else if (product.issues.case3) {
          // Caso 3: ID no coincide con primer elemento - corregir ID
          updateData.shippingRuleId = product.shippingRuleIds[0];
        }
        
        // Siempre eliminar campos problemáticos
        if (product.issues.case4) {
          updateData.shippingRulesInfo = null;
          updateData.shippingRuleInfo = null;
        }
        
        // Actualizar producto
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, updateData);
        
        console.log(`✅ Producto ${product.id} (${product.name}) reparado`);
        successCount++;
        
      } catch (error) {
        console.error(`Error al reparar producto ${product.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Reparación completada: ${successCount} productos reparados, ${errorCount} errores`);
    
  } catch (error) {
    console.error('Error al reparar productos:', error);
  }
};

// Exportar funciones para usar en la consola
window.fixProductShippingRules = fixProductShippingRules;
window.fixAllProductsShippingRules = fixAllProductsShippingRules; 