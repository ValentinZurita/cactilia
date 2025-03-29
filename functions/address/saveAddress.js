const { getFirestore } = require('firebase-admin/firestore');

/**
 * Cloud Function para guardar una dirección de envío en el perfil del usuario
 *
 * @param {Object} data - Datos de la dirección
 * @param {string} data.address - Datos de la dirección (nombre, calle, etc.)
 * @param {boolean} data.isDefault - Si es la dirección predeterminada
 * @param {Object} context - Contexto de la función
 * @returns {Promise<{success: boolean, addressId: string, error: string}>} - Resultado de la operación
 */
exports.saveAddress = async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new Error('No autenticado. Por favor inicie sesión primero.');
  }

  const userId = context.auth.uid;
  const { address, isDefault } = data;

  // Validar campos requeridos
  if (!address || !address.name || !address.street || !address.city || !address.state || !address.zip) {
    throw new Error('Datos de dirección incompletos');
  }

  try {
    const db = getFirestore();
    const addressesRef = db.collection('users').doc(userId).collection('addresses');

    // Si es dirección predeterminada, desmarcar cualquier otra
    if (isDefault) {
      const defaultAddressesSnapshot = await addressesRef.where('isDefault', '==', true).get();

      const batch = db.batch();
      defaultAddressesSnapshot.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
      });

      await batch.commit();
    }

    // Guardar la nueva dirección
    const newAddressRef = await addressesRef.add({
      name: address.name,
      street: address.street,
      numExt: address.numExt || '',
      numInt: address.numInt || '',
      colonia: address.colonia || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      references: address.references || '',
      isDefault: isDefault === true,
      createdAt: new Date(),
    });

    return {
      success: true,
      addressId: newAddressRef.id,
      error: null
    };
  } catch (error) {
    console.error('Error al guardar dirección:', error);
    throw new Error(`Error al guardar dirección: ${error.message}`);
  }
};