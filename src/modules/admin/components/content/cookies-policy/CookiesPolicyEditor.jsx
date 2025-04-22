import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { EditorToolbar } from '../shared/EditorToolbar';
import { EditorActionBar } from '../shared/EditorActionBar';
import { PageMetadataEditor } from '../shared/PageMetadataEditor';

/**
 * Editor para el contenido de la página de Política de Cookies.
 *
 * @param {object} props
 * @param {object | null} props.initialData - Datos iniciales cargados.
 * @param {function} props.onSave - Callback para guardar borrador.
 * @param {function} props.onPublish - Callback para publicar.
 * @param {boolean} props.isLoading - Indica si hay operación en curso.
 */
export const CookiesPolicyEditor = memo(({
  initialData,
  onSave,
  onPublish,
  isLoading,
}) => {
  // Estado local para los datos del editor
  const [localData, setLocalData] = useState(initialData || {
    pageTitle: 'Política de Cookies', // Valores por defecto si initialData es null
    pageDescription: 'Detalles sobre el uso de cookies en nuestro sitio.',
    mainContent: '', 
  }); 
  // Estado para detectar si hay cambios
  const [isDirty, setIsDirty] = useState(false);

  /* // ELIMINADO: useEffect de sincronización problemático
  // Sincronizar con initialData si cambia desde fuera (p.ej., después de guardar)
  useEffect(() => {
    if (initialData) {
        // Solo actualizar si no hay cambios pendientes o si los datos iniciales son diferentes
        const initialJson = JSON.stringify(initialData);
        const localJson = JSON.stringify(localData);
        if (!isDirty || initialJson !== localJson) {
            setLocalData(JSON.parse(initialJson)); // Usar deep copy
        }
    }
  }, [initialData, isDirty]);
  */

  // Detectar cambios comparando con initialData
  useEffect(() => {
    const localJson = JSON.stringify(localData);
    const initialJson = JSON.stringify(initialData || {
        pageTitle: 'Política de Cookies', 
        pageDescription: 'Detalles sobre el uso de cookies en nuestro sitio.',
        mainContent: '', 
    });
    setIsDirty(localJson !== initialJson);
  }, [localData, initialData]);

  // Manejador de cambios genérico para los inputs/textarea
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setLocalData(prevData => {
        const updatedData = { ...prevData, [name]: value };
        return updatedData;
    });
  }, []);

  const previewUrl = `/cookies-policy?preview=true&t=${Date.now()}`;
  const hasSavedContent = useMemo(() => !!initialData?.createdAt, [initialData]); // Determinar si existe contenido previo

  // Preparar callbacks para la barra de acciones
  const handleSaveChanges = () => onSave(localData); // onSave viene del hook
  const handlePublishChanges = () => onPublish(localData); // onPublish viene del hook

  return (
    <>
      <EditorToolbar previewUrl={previewUrl} hasChanges={isDirty} />

      {/* Usar el componente reutilizable PageMetadataEditor */}
      <PageMetadataEditor 
        pageTitle={localData.pageTitle}
        pageDescription={localData.pageDescription}
        onChange={handleChange} // El handler genérico funciona aquí
        isLoading={isLoading}
      />

      {/* Contenido Principal (sin cambios) */}
      <div className="card mb-4">
        <div className="card-header">Contenido Principal de la Política</div>
        <div className="card-body">
          <textarea
            className="form-control"
            id="mainContent"
            name="mainContent"
            rows="15"
            value={localData.mainContent || ''}
            onChange={handleChange} // Usar el mismo handler genérico
            disabled={isLoading}
            placeholder="Escribe aquí el texto completo de la política de cookies..."
          ></textarea>
        </div>
      </div>

      <EditorActionBar
        onSave={handleSaveChanges} // Usar el wrapper local
        onPublish={handlePublishChanges} // Usar el wrapper local
        saving={isLoading} // Pasar estado de carga
        publishing={isLoading} // Simplificado, usamos el mismo flag
        hasChanges={isDirty} // Pasar si hay cambios
        hasSavedContent={hasSavedContent} // Pasar si hay contenido guardado previamente
      />
    </>
  );
});

CookiesPolicyEditor.displayName = 'CookiesPolicyEditor'; 