import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB, FirebaseStorage } from '../../../../firebase/firebaseConfig.js'


/**
 * Sube una factura para un pedido específico
 *
 * @param {string} orderId - ID del pedido
 * @param {File} invoiceFile - Archivo de factura
 * @param {string} adminId - ID del administrador que sube la factura
 * @returns {Promise<{ok: boolean, data: Object, error: string}>} - Resultado de la operación
 */
export const uploadInvoiceForOrder = async (orderId, invoiceFile, adminId) => {
  try {
    if (!orderId || !invoiceFile || !adminId) {
      return {
        ok: false,
        error: 'Faltan datos requeridos para subir la factura'
      };
    }

    // Referencia al pedido en Firestore
    const orderRef = doc(FirebaseDB, 'orders', orderId);

    // Subir el archivo a Firebase Storage
    const storagePath = `invoices/${orderId}/${Date.now()}_${invoiceFile.name}`;
    const storageRef = ref(FirebaseStorage, storagePath);

    // Ejecutar la subida
    const uploadResult = await uploadBytes(storageRef, invoiceFile);

    // Obtener la URL del archivo subido
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Actualizar el pedido con la información de la factura
    await updateDoc(orderRef, {
      'billing.invoiceUrl': downloadURL,
      'billing.invoiceFileName': invoiceFile.name,
      'billing.invoiceUploadedAt': serverTimestamp(),
      'billing.invoiceUploadedBy': adminId,
      'updatedAt': serverTimestamp()
    });

    return {
      ok: true,
      data: {
        invoiceUrl: downloadURL,
        invoiceFileName: invoiceFile.name
      },
      error: null
    };
  } catch (error) {
    console.error('Error al subir la factura:', error);
    return {
      ok: false,
      error: error.message || 'Error al subir la factura'
    };
  }
};

/**
 * Elimina la factura de un pedido
 *
 * @param {string} orderId - ID del pedido
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const removeInvoiceFromOrder = async (orderId) => {
  try {
    if (!orderId) {
      return {
        ok: false,
        error: 'ID de pedido no proporcionado'
      };
    }

    // Referencia al pedido en Firestore
    const orderRef = doc(FirebaseDB, 'orders', orderId);

    // Actualizar el pedido eliminando la información de la factura
    await updateDoc(orderRef, {
      'billing.invoiceUrl': null,
      'billing.invoiceFileName': null,
      'billing.invoiceUploadedAt': null,
      'billing.invoiceUploadedBy': null,
      'updatedAt': serverTimestamp()
    });

    // Nota: No eliminamos el archivo de Storage por ahora para mantener un historial

    return {
      ok: true,
      error: null
    };
  } catch (error) {
    console.error('Error al eliminar la factura:', error);
    return {
      ok: false,
      error: error.message || 'Error al eliminar la factura'
    };
  }
};