import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { FaqItemEditor } from './FaqItemEditor'; // Importa el editor de item
import { getFaqContent } from './faqService'; // Importa la función para obtener datos
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos para nuevos items
import { EditorActionBar } from '../shared/EditorActionBar'; // Importar la barra de acciones
import { EditorToolbar } from '../shared/EditorToolbar'; // Importar EditorToolbar

/**
 * Componente principal para editar el contenido de la página de FAQ.
 * Utiliza EditorToolbar para previsualización y EditorActionBar para guardar/publicar.
 * Muestra una lista editable de items de FAQ (FaqItemEditor) y permite añadir/eliminar/reordenar.
 * Maneja el estado local de los datos del editor y detecta cambios pendientes.
 *
 * @param {object} props
 * @param {object | null} props.initialData - Datos originales cargados desde Firestore o null.
 * @param {function} props.onSave - Callback llamado por EditorActionBar para guardar el borrador.
 * @param {function} props.onPublish - Callback llamado por EditorActionBar para publicar.
 * @param {boolean} [props.isLoading=false] - Indica si hay una operación (guardar/publicar) en curso.
 * @param {string | null} [props.error=null] - Mensaje de error a mostrar si ocurre un problema.
 * @returns {JSX.Element}
 */
export const FaqEditor = memo(({
  initialData,
  onSave,
  onPublish,
  isLoading = false,
  error = null,
}) => {
  // Estado para los datos actuales en el editor
  const [pageData, setPageData] = useState(() => JSON.parse(JSON.stringify(initialData || {
    pageTitle: 'Preguntas Frecuentes',
    pageDescription: '',
    faqItems: [],
  }))); // Copia profunda inicial

  // Estado para detectar cambios
  const [isDirty, setIsDirty] = useState(false);

  // Detectar cambios comparando pageData con initialData
  useEffect(() => {
    // Compara las versiones serializadas para una comparación de valor más fiable
    const currentJson = JSON.stringify(pageData);
    const initialJson = JSON.stringify(initialData);
    setIsDirty(currentJson !== initialJson);
  }, [pageData, initialData]);

  // Actualizar pageData si initialData cambia desde fuera (después de guardar)
  useEffect(() => {
    if (initialData) {
      // Solo actualiza si no está sucio para no perder cambios no guardados
      // O si la versión inicial JSON es diferente de la actual (refleja un guardado)
      if (!isDirty || JSON.stringify(initialData) !== JSON.stringify(pageData)) {
         setPageData(JSON.parse(JSON.stringify(initialData)));
      }
    }
  }, [initialData]); // Dependencia solo de initialData

  // Manejador para cambios en campos generales (título, descripción)
  const handlePageDataChange = (event) => {
    const { name, value } = event.target;
    setPageData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    // setIsDirty(true); // Se maneja con useEffect ahora
  };

  // Añadir un nuevo item de FAQ vacío
  const handleAddItem = () => {
    setPageData(prevData => ({
      ...prevData,
      faqItems: [
        ...prevData.faqItems,
        { id: uuidv4(), question: '', answer: '' },
      ],
    }));
    // setIsDirty(true);
  };

  // Actualizar un item de FAQ existente en la lista
  const handleUpdateItem = useCallback((index, field, value) => {
    setPageData(prevData => {
      const updatedItems = [...prevData.faqItems];
      if (updatedItems[index]) {
        updatedItems[index] = { ...updatedItems[index], [field]: value };
      }
      return { ...prevData, faqItems: updatedItems };
    });
    setIsDirty(true); // Marcar como sucio al actualizar
  }, []);

  // Eliminar un item de FAQ de la lista
  const handleRemoveItem = useCallback((index) => {
    setPageData(prevData => ({
      ...prevData,
      faqItems: prevData.faqItems.filter((_, i) => i !== index),
    }));
    setIsDirty(true); // Marcar como sucio al eliminar
  }, []);

  // Mover un item hacia arriba
  const handleMoveItemUp = useCallback((index) => {
    if (index === 0) return; // No se puede mover más arriba
    setPageData(prevData => {
      const items = [...prevData.faqItems];
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
      return { ...prevData, faqItems: items };
    });
    setIsDirty(true); // Marcar como sucio al reordenar
  }, []);

  // Mover un item hacia abajo
  const handleMoveItemDown = useCallback((index) => {
    setPageData(prevData => {
      const items = [...prevData.faqItems];
      if (index >= items.length - 1) return; // No se puede mover más abajo
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
      return { ...prevData, faqItems: items };
    });
    setIsDirty(true); // Marcar como sucio al reordenar
  }, []);

  // Llamar al callback onSave cuando el botón Guardar de la ActionBar se presione
  const handleSaveChanges = () => {
    if (onSave) {
      onSave(pageData); // Pasa los datos actuales del editor
      //setIsDirty(false); // Se reseteará cuando initialData se actualice
    }
  };

  // Llamar al callback onPublish cuando el botón Publicar de la ActionBar se presione
  const handlePublishChanges = () => {
    if (onPublish) {
      // La lógica en ManagementPage ya guarda antes de publicar
      onPublish(); 
      //setIsDirty(false); // Se reseteará cuando initialData se actualice
    }
  };

  // Determinar si hay contenido guardado (para habilitar "Publicar")
  const hasSavedContent = useMemo(() => !!initialData?.createdAt, [initialData]);

  // Construir la URL de previsualización
  const previewUrl = `/faq?preview=true&t=${Date.now()}`;

  return (
    <>
      <EditorToolbar 
        previewUrl={previewUrl} 
        hasChanges={isDirty}
      />

      {error && <div className="alert alert-danger mt-3">Error: {error}</div>}

      {/* Campos para Título y Descripción de la Página */}
      <div className="card mb-4">
        <div className="card-header">Información de la Página</div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="pageTitle" className="form-label">Título de la Página</label>
            <input
              type="text"
              className="form-control"
              id="pageTitle"
              name="pageTitle"
              value={pageData.pageTitle}
              onChange={handlePageDataChange}
              disabled={isLoading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="pageDescription" className="form-label">Descripción Corta (SEO)</label>
            <textarea
              className="form-control"
              id="pageDescription"
              name="pageDescription"
              rows="3"
              value={pageData.pageDescription}
              onChange={handlePageDataChange}
              disabled={isLoading}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Sección para editar los Items de FAQ */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Preguntas y Respuestas</span>
          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={handleAddItem}
            disabled={isLoading}
          >
            + Añadir Pregunta
          </button>
        </div>
        <div className="card-body">
          {pageData.faqItems && pageData.faqItems.length > 0 ? (
            pageData.faqItems.map((item, index) => (
              <FaqItemEditor
                key={item.id || index}
                item={item}
                index={index}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
                onMoveUp={handleMoveItemUp}      // Pasar nueva función
                onMoveDown={handleMoveItemDown}  // Pasar nueva función
                isFirst={index === 0}           // Pasar flag isFirst
                isLast={index === pageData.faqItems.length - 1} // Pasar flag isLast
              />
            ))
          ) : (
            <p className="text-muted">No hay preguntas frecuentes añadidas todavía.</p>
          )}
        </div>
      </div>

      {/* Usar la barra de acciones compartida */}
      <EditorActionBar
        onSave={handleSaveChanges}
        onPublish={handlePublishChanges}
        // onReset={handleReset} // Opcional: implementar si se necesita
        saving={isLoading}      // Usar isLoading como indicador de guardado
        publishing={isLoading} // Usar isLoading como indicador de publicación
        hasChanges={isDirty}    // Pasar el estado de cambios detectados
        hasSavedContent={hasSavedContent} // Indica si ya hay algo guardado
      />
    </>
  );
});

// Opcional: Añadir displayName
FaqEditor.displayName = 'FaqEditor'; 