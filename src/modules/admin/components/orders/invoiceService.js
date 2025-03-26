import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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
 * Elimina un archivo de factura específico (PDF o XML) de un pedido
 *
 * @param {string} orderId - ID del pedido
 * @param {string} fileType - Tipo de archivo ('pdf' o 'xml')
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const removeInvoiceFileByType = async (orderId, fileType) => {
  try {
    if (!orderId) {
      return {
        ok: false,
        error: 'ID de pedido no proporcionado'
      };
    }

    if (fileType !== 'pdf' && fileType !== 'xml') {
      return {
        ok: false,
        error: 'Tipo de archivo no válido. Debe ser "pdf" o "xml"'
      };
    }

    // Obtener primero el documento para tener las rutas de los archivos
    const orderRef = doc(FirebaseDB, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      return {
        ok: false,
        error: 'El pedido no existe'
      };
    }

    const orderData = orderDoc.data();
    const billing = orderData.billing || {};

    // Definir las rutas y campos según el tipo de archivo
    let filePath, updateFields;

    if (fileType === 'pdf') {
      filePath = billing.invoicePdfPath;
      updateFields = {
        'billing.invoicePdfUrl': null,
        'billing.invoicePdfName': null,
        'billing.invoicePdfPath': null,
        // Compatibilidad con versión anterior
        'billing.invoiceUrl': null,
        'billing.invoiceFileName': null,
        'billing.invoiceFilePath': null
      };
    } else { // XML
      filePath = billing.invoiceXmlPath;
      updateFields = {
        'billing.invoiceXmlUrl': null,
        'billing.invoiceXmlName': null,
        'billing.invoiceXmlPath': null
      };
    }

    // Verificar si existe el archivo para eliminar
    if (!filePath) {
      return {
        ok: false,
        error: `No hay archivo ${fileType.toUpperCase()} para eliminar`
      };
    }

    // Eliminar el archivo físico de Storage
    try {
      const fileRef = ref(FirebaseStorage, filePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn(`Error al eliminar archivo ${fileType.toUpperCase()}:`, err);
      // Continuamos a pesar del error para actualizar la base de datos
    }

    // Actualizar el documento para eliminar las referencias
    updateFields['updatedAt'] = serverTimestamp();

    // Si ambos archivos se han eliminado, también limpiar los campos de timestamp
    const otherTypeExists = fileType === 'pdf' ?
      (billing.invoiceXmlPath !== null && billing.invoiceXmlPath !== undefined) :
      (billing.invoicePdfPath !== null && billing.invoicePdfPath !== undefined);

    if (!otherTypeExists) {
      updateFields['billing.invoiceUploadedAt'] = null;
      updateFields['billing.invoiceUploadedBy'] = null;
    }

    await updateDoc(orderRef, updateFields);

    return {
      ok: true,
      error: null
    };
  } catch (error) {
    console.error(`Error al eliminar archivo ${fileType}:`, error);
    return {
      ok: false,
      error: error.message || `Error al eliminar archivo ${fileType}`
    };
  }
};

/**
 * Elimina todos los archivos de factura de un pedido
 * Versión corregida que elimina también los archivos físicos de Storage
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

    // Obtener primero el documento para tener las rutas de los archivos
    const orderRef = doc(FirebaseDB, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      return {
        ok: false,
        error: 'El pedido no existe'
      };
    }

    const orderData = orderDoc.data();
    const billing = orderData.billing || {};

    // Eliminar archivos físicos de Storage
    const deletePromises = [];

    // Eliminar PDF
    if (billing.invoicePdfPath) {
      const pdfRef = ref(FirebaseStorage, billing.invoicePdfPath);
      deletePromises.push(deleteObject(pdfRef).catch(err => {
        console.warn('Error al eliminar PDF:', err);
        // Continuamos a pesar del error
      }));
    }

    // Eliminar XML
    if (billing.invoiceXmlPath) {
      const xmlRef = ref(FirebaseStorage, billing.invoiceXmlPath);
      deletePromises.push(deleteObject(xmlRef).catch(err => {
        console.warn('Error al eliminar XML:', err);
        // Continuamos a pesar del error
      }));
    }

    // Eliminar archivo de factura (compatibilidad con versión anterior)
    if (billing.invoiceFilePath &&
      billing.invoiceFilePath !== billing.invoicePdfPath) {
      const fileRef = ref(FirebaseStorage, billing.invoiceFilePath);
      deletePromises.push(deleteObject(fileRef).catch(err => {
        console.warn('Error al eliminar factura:', err);
        // Continuamos a pesar del error
      }));
    }

    // Esperar a que se eliminen todos los archivos
    await Promise.all(deletePromises);

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