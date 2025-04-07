import React, { useState, useEffect } from 'react';
import { useCompanyInfo } from './hooks/useCompanyInfo';
import { PageHeader } from './components/header/PageHeader';
import { CompanyInfoForm } from './components/form/CompanyInfoForm';
import { SaveFeedback } from './components/common/SaveFeedback';

/**
 * Componente principal para la gestión de información de la empresa
 * Maneja la carga, visualización y guardado de los datos de la empresa
 * 
 * @returns {JSX.Element} Componente de administración de información
 */
const CompanyInfoManagement = () => {
  // Usar hook personalizado para manejar la información de la empresa
  const { 
    companyInfo, 
    loading, 
    error, 
    saveCompanyInfo,
    resetStatus
  } = useCompanyInfo();
  
  // Estados locales para gestionar feedback de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Limpiar feedback después de un tiempo
  useEffect(() => {
    let timer;
    if (saveSuccess || saveError) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(null);
        resetStatus();
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess, saveError, resetStatus]);
  
  /**
   * Manejar guardado de información
   * @param {Object} formData - Datos del formulario a guardar
   */
  const handleSaveInfo = async (formData) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      await saveCompanyInfo(formData);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error al guardar información:', err);
      setSaveError(err.message || 'Error al guardar la información');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <section className="company-info-management py-4">
      <PageHeader 
        title="Datos de la Empresa" 
        description="Administra la información general de la empresa que se mostrará en el sitio"
      />
      
      {/* Mostrar error global si existe */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      
      {/* Mostrar feedback de guardado */}
      {(saveSuccess || saveError) && (
        <SaveFeedback 
          success={saveSuccess}
          error={saveError}
          onDismiss={() => {
            setSaveSuccess(false);
            setSaveError(null);
          }}
        />
      )}
      
      {/* Mostrar spinner durante la carga inicial */}
      {loading && !companyInfo && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información de la empresa...</p>
        </div>
      )}
      
      {/* Formulario de información de la empresa */}
      {(!loading || companyInfo) && (
        <CompanyInfoForm 
          initialData={companyInfo}
          onSave={handleSaveInfo}
          isSaving={isSaving}
        />
      )}
    </section>
  );
};

export default CompanyInfoManagement; 