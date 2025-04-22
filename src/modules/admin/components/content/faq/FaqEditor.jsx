import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { FaqItemEditor } from './FaqItemEditor'; // Importa el editor de item
// import { getFaqContent } from './faqService'; // Ya no se usa aquí, lo maneja el hook
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos para nuevos items
import { EditorActionBar } from '../shared/EditorActionBar'; // Importar la barra de acciones
import { EditorToolbar } from '../shared/EditorToolbar'; // Importar EditorToolbar
import { PageMetadataEditor } from '../shared/PageMetadataEditor'; // Importar el nuevo componente

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
  const [pageData, setPageData] = useState(() => 
    JSON.parse(JSON.stringify(initialData || {
      pageTitle: 'Preguntas Frecuentes',
      pageDescription: '',
      faqItems: [],
    }))
  ); 
  const [isDirty, setIsDirty] = useState(false);

  // Efecto para detectar cambios (comparación profunda)
  useEffect(() => {
    const currentJson = JSON.stringify(pageData);
    const initialJson = JSON.stringify(initialData || {
      pageTitle: 'Preguntas Frecuentes', 
      pageDescription: '',
      faqItems: [],
    });
    setIsDirty(currentJson !== initialJson);
  }, [pageData, initialData]);

  // Efecto para sincronizar con los datos iniciales/guardados desde el padre
  useEffect(() => {
    if (initialData) {
      // Solo actualiza si no hay cambios pendientes o si los datos iniciales realmente cambiaron
      const initialJson = JSON.stringify(initialData);
      const currentJson = JSON.stringify(pageData);
      if (!isDirty || initialJson !== currentJson) {
         // Usar deep copy al setear desde initialData
         setPageData(JSON.parse(initialJson));
      }
    }
  }, [initialData, isDirty]); // Agregar isDirty a las dependencias

  // --- Manejadores de Cambios Internos --- 

  const handlePageDataChange = useCallback((event) => {
    const { name, value } = event.target;
    setPageData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  const handleAddItem = useCallback(() => {
    setPageData(prevData => ({
      ...prevData,
      faqItems: [
        ...(prevData.faqItems || []), 
        { id: uuidv4(), question: '', answer: '' },
      ],
    }));
  }, []);

  const handleUpdateItem = useCallback((index, field, value) => {
    setPageData(prevData => {
      const updatedItems = [...(prevData.faqItems || [])];
      if (updatedItems[index]) {
        updatedItems[index] = { ...updatedItems[index], [field]: value };
      }
      return { ...prevData, faqItems: updatedItems };
    });
  }, []);

  const handleRemoveItem = useCallback((index) => {
    setPageData(prevData => ({
      ...prevData,
      faqItems: (prevData.faqItems || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleMoveItemUp = useCallback((index) => {
    if (index === 0) return;
    setPageData(prevData => {
      const items = [...(prevData.faqItems || [])];
      [items[index], items[index - 1]] = [items[index - 1], items[index]]; 
      return { ...prevData, faqItems: items };
    });
  }, []);

  const handleMoveItemDown = useCallback((index) => {
    setPageData(prevData => {
      const items = [...(prevData.faqItems || [])];
      if (index >= items.length - 1) return;
      [items[index], items[index + 1]] = [items[index + 1], items[index]]; 
      return { ...prevData, faqItems: items };
    });
  }, []);

  // --- Lógica para pasar a componentes hijos --- 

  const handleSaveChanges = () => onSave(pageData);
  const handlePublishChanges = () => onPublish();
  const hasSavedContent = useMemo(() => !!initialData?.createdAt, [initialData]);
  const previewUrl = `/faq?preview=true&t=${Date.now()}`;

  return (
    <>
      <EditorToolbar 
        previewUrl={previewUrl} 
        hasChanges={isDirty}
      />

      {/* Mostrar error pasado desde el padre */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* --- Renderizado de Formularios --- */}
      
      {/* Usar el componente reutilizable PageMetadataEditor */}
      <PageMetadataEditor 
        pageTitle={pageData.pageTitle}
        pageDescription={pageData.pageDescription}
        onChange={handlePageDataChange} // El mismo handler sirve
        isLoading={isLoading}
      />

      {/* Card Preguntas y Respuestas */}
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
          {(pageData?.faqItems && pageData.faqItems.length > 0) ? (
            pageData.faqItems.map((item, index) => (
              <FaqItemEditor
                key={item.id || index}
                item={item}
                index={index}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
                onMoveUp={handleMoveItemUp}
                onMoveDown={handleMoveItemDown}
                isFirst={index === 0}
                isLast={index === (pageData.faqItems.length - 1)}
              />
            ))
          ) : (
            <p className="text-muted">No hay preguntas frecuentes añadidas todavía.</p>
          )}
        </div>
      </div>

      {/* Barra de Acciones Inferior */}
      <EditorActionBar
        onSave={handleSaveChanges}
        onPublish={handlePublishChanges}
        saving={isLoading}
        publishing={isLoading}
        hasChanges={isDirty}
        hasSavedContent={hasSavedContent}
      />
    </>
  );
});

// Opcional: Añadir displayName
FaqEditor.displayName = 'FaqEditor'; 