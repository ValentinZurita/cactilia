const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");

// Asumimos que admin ya está inicializado en index.js
const firestore = admin.firestore();
const storage = admin.storage();

// *** CONFIGURACIÓN ***
// const THUMBNAIL_FOLDER = "thumbnails"; // Ya no necesitamos esto para la validación principal
const FIRESTORE_COLLECTION = "media"; // Tu colección de metadatos
const ORIGINAL_FILENAME_FIELD = "filename"; // Usar el campo correcto de tu Firestore
const RESIZED_URLS_FIELD = "resizedUrls"; // Campo mapa para URLs

exports.updateFirestoreWithThumbnails = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;
    const bucketName = object.bucket;

    // Salir si no es imagen
    if (!contentType || !contentType.startsWith("image/")) {
      // functions.logger.log(`Archivo ${filePath} no es una imagen.`); // Log opcional
      return null;
    }
    
    // *** CAMBIO: Validar por patrón de nombre en lugar de carpeta ***
    const fileNameWithSuffix = path.basename(filePath);
    const sizeMatch = fileNameWithSuffix.match(/_(\d+x\d+)\./);
    const sizeString = sizeMatch ? sizeMatch[1] : null;

    // Si NO se encuentra el patrón de tamaño, asumir que es el original (o archivo no relevante) y salir.
    if (!sizeString) {
      functions.logger.log(
        `Archivo ${filePath} no parece ser un thumbnail generado (sin sufijo _WxH), ignorando.`
      );
      return null;
    }
    
    // Si llegamos aquí, ES un thumbnail, proceder.
    functions.logger.log(`Procesando thumbnail: ${filePath} (Tamaño: ${sizeString})`);

    // Extraer nombre original (quitar sufijo de tamaño Y prefijo de timestamp)
    const originalFileNameWithTimestamp = fileNameWithSuffix.replace(`_${sizeString}`, "");
    const originalFileNameWithoutTimestamp = originalFileNameWithTimestamp.replace(/^\d+_/, '');
    functions.logger.log(`Intentando buscar con filename: ${originalFileNameWithoutTimestamp}`);

    // Obtener URL pública
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    let publicUrl = '';
    try {
      publicUrl = file.publicUrl();
      await file.makePublic(); 
      publicUrl = file.publicUrl(); 
       functions.logger.log(`URL pública obtenida: ${publicUrl}`);
    } catch (err) {
      functions.logger.error(
        `Error al obtener URL pública/hacer público ${filePath}:`,
        err
      );
      return null; 
    }
   
    // Buscar y actualizar documento Firestore
    try {
      const mediaRef = firestore.collection(FIRESTORE_COLLECTION);
      const q = mediaRef.where(ORIGINAL_FILENAME_FIELD, "==", originalFileNameWithoutTimestamp);
      const querySnapshot = await q.get();

      if (querySnapshot.empty) {
        functions.logger.warn(
          `No se encontró doc en ${FIRESTORE_COLLECTION} where ${ORIGINAL_FILENAME_FIELD} == ${originalFileNameWithoutTimestamp}`
        );
        return null;
      }

      const updates = querySnapshot.docs.map(docToUpdate => {
        functions.logger.log(`Doc encontrado: ${docToUpdate.id}`);
        const updateData = {};
        updateData[`${RESIZED_URLS_FIELD}.${sizeString}`] = publicUrl;
        return docToUpdate.ref.update(updateData);
      });
      
      await Promise.all(updates);

      functions.logger.log(
        `Documentos actualizados para ${originalFileNameWithoutTimestamp} con ${sizeString} URL: ${publicUrl}`
      );
      return null;
    } catch (error) {
      functions.logger.error("Error Firestore:", error);
      return null;
    }
  }); 