import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB, FirebaseStorage } from '../../../../firebase/firebaseConfig.js'

/**
 * Sube archivos de facturación (PDF y XML) para un pedido específico
 * Con estructura organizada por año/mes
 *
 * @param {string} orderId - ID del pedido
 * @param {File} pdfFile - Archivo PDF de la factura
 * @param {File} xmlFile - Archivo XML de la factura
 * @param {string} adminId - ID del administrador que sube la factura
 * @returns {Promise<{ok: boolean, data: Object, error: string}>} - Resultado de la operación
 */
export const uploadInvoiceFilesForOrder = async (orderId, pdfFile, xmlFile, adminId) => {
  try {
    if (!orderId || !adminId || (!pdfFile && !xmlFile)) {
      return {
        ok: false,
        error: 'Faltan datos requeridos para subir la factura'
      };
    }

    // Referencia al pedido en Firestore
    const orderRef = doc(FirebaseDB, 'orders', orderId);

    // Crear la estructura de carpetas año/mes
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Formato: 01, 02, etc.

    const updateData = {
      'updatedAt': serverTimestamp(),
      'billing.invoiceUploadedAt': serverTimestamp(),
      'billing.invoiceUploadedBy': adminId
    };

    // Subir archivo PDF si se proporciona
    if (pdfFile) {
      const pdfPath = `invoices/${año}/${mes}/${orderId}_${pdfFile.name}`;
      const pdfRef = ref(FirebaseStorage, pdfPath);
      const pdfUploadResult = await uploadBytes(pdfRef, pdfFile);
      const pdfUrl = await getDownloadURL(pdfUploadResult.ref);

      updateData['billing.invoicePdfUrl'] = pdfUrl;
      updateData['billing.invoicePdfName'] = pdfFile.name;
      updateData['billing.invoicePdfPath'] = pdfPath; // Guardar la ruta para referencia
    }

    // Subir archivo XML si se proporciona
    if (xmlFile) {
      const xmlPath = `invoices/${año}/${mes}/${orderId}_${xmlFile.name}`;
      const xmlRef = ref(FirebaseStorage, xmlPath);
      const xmlUploadResult = await uploadBytes(xmlRef, xmlFile);
      const xmlUrl = await getDownloadURL(xmlUploadResult.ref);

      updateData['billing.invoiceXmlUrl'] = xmlUrl;
      updateData['billing.invoiceXmlName'] = xmlFile.name;
      updateData['billing.invoiceXmlPath'] = xmlPath; // Guardar la ruta para referencia
    }

    // Para mantener compatibilidad con el código anterior
    if (pdfFile) {
      updateData['billing.invoiceUrl'] = updateData['billing.invoicePdfUrl'];
      updateData['billing.invoiceFileName'] = updateData['billing.invoicePdfName'];
      updateData['billing.invoiceFilePath'] = updateData['billing.invoicePdfPath'];
    }

    // Actualizar el pedido con la información de la factura
    await updateDoc(orderRef, updateData);

    return {
      ok: true,
      data: {
        pdfUrl: updateData['billing.invoicePdfUrl'],
        pdfName: updateData['billing.invoicePdfName'],
        pdfPath: updateData['billing.invoicePdfPath'],
        xmlUrl: updateData['billing.invoiceXmlUrl'],
        xmlName: updateData['billing.invoiceXmlName'],
        xmlPath: updateData['billing.invoiceXmlPath']
      },
      error: null
    };
  } catch (error) {
    console.error('Error al subir archivos de factura:', error);
    return {
      ok: false,
      error: error.message || 'Error al subir archivos de factura'
    };
  }
};

/**
 * Elimina los archivos de factura de un pedido
 *
 * @param {string} orderId - ID del pedido
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const removeInvoiceFilesFromOrder = async (orderId) => {
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
      // Campos nuevos
      'billing.invoicePdfUrl': null,
      'billing.invoicePdfName': null,
      'billing.invoicePdfPath': null,
      'billing.invoiceXmlUrl': null,
      'billing.invoiceXmlName': null,
      'billing.invoiceXmlPath': null,

      // Campos anteriores para mantener compatibilidad
      'billing.invoiceUrl': null,
      'billing.invoiceFileName': null,
      'billing.invoiceFilePath': null,

      'billing.invoiceUploadedAt': null,
      'billing.invoiceUploadedBy': null,
      'updatedAt': serverTimestamp()
    });

    // Nota: No eliminamos los archivos de Storage por ahora para mantener un historial

    return {
      ok: true,
      error: null
    };
  } catch (error) {
    console.error('Error al eliminar archivos de factura:', error);
    return {
      ok: false,
      error: error.message || 'Error al eliminar archivos de factura'
    };
  }
};

// Mantenemos el nombre anterior para retrocompatibilidad
export const uploadInvoiceForOrder = uploadInvoiceFilesForOrder;
export const removeInvoiceFromOrder = removeInvoiceFilesFromOrder;