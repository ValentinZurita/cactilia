import React, { useState, useEffect } from 'react';
import { CompanyInfoForm } from '../components/form/CompanyInfoForm';
import { SaveFeedback } from '../components/common/SaveFeedback';
import { companyInfoService } from '../services/companyInfoService';
import NavigationTabs from '../components/navigation/NavigationTabs';
import GeneralSection from '../components/sections/GeneralSection';
import ContactSection from '../components/sections/ContactSection';
import BusinessHoursSection from '../components/sections/BusinessHoursSection';
import SocialMediaSection from '../components/sections/SocialMediaSection';
import PaymentSection from '../components/sections/PaymentSection';

/**
 * Página principal para la sección de Datos de la Empresa
 * Estilo elegante y minimalista similar a Orders y Shipping
 * 
 * @returns {JSX.Element} Página de datos de la empresa
 */
const CompanyInfoPage = () => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('general');
  const [saveStatus, setSaveStatus] = useState({
    success: false,
    error: null,
    loading: false
  });

  // Cargar datos de la empresa al iniciar
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar el servicio real para Firestore
        const data = await companyInfoService.getCompanyInfo();
        
        setCompanyData(data);
      } catch (err) {
        console.error('Error loading company data:', err);
        setError('No se pudieron cargar los datos de la empresa');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  /**
   * Guardar los datos de la empresa
   * @param {Object} data - Datos de la empresa a guardar
   */
  const handleSave = async (data) => {
    try {
      setSaveStatus({ success: false, error: null, loading: true });
      
      // Usar el servicio real para guardar en Firestore
      await companyInfoService.saveCompanyInfo(data);
      
      // Actualizar datos locales
      setCompanyData(data);
      
      // Mostrar mensaje de éxito
      setSaveStatus({ 
        success: 'Los datos de la empresa se han guardado correctamente', 
        error: null, 
        loading: false 
      });
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, success: false }));
      }, 5000);
      
    } catch (err) {
      console.error('Error saving company data:', err);
      setSaveStatus({ 
        success: false, 
        error: 'No se pudieron guardar los datos de la empresa: ' + (err.message || 'Error desconocido'), 
        loading: false 
      });
    }
  };

  /**
   * Manejar cambios en secciones específicas y actualizar datos
   */
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  /**
   * Actualizar una sección específica de los datos
   */
  const handleSectionUpdate = (sectionName, sectionData) => {
    if (!companyData) return;
    
    const updatedData = {
      ...companyData,
      [sectionName]: sectionData
    };
    
    setCompanyData(updatedData);
  };

  /**
   * Ocultar mensajes de retroalimentación
   */
  const handleDismissFeedback = () => {
    setSaveStatus({
      success: false,
      error: null,
      loading: false
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center py-5 my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger py-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <div>
              <h5 className="mb-1">Error al cargar datos</h5>
              <p className="mb-0">{error}</p>
            </div>
          </div>
          <div className="mt-3">
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (!companyData) return null;

    // Renderizar sección activa
    return (
      <div className="bg-white rounded-3 shadow-sm">
        <NavigationTabs 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
        
        <div className="p-4">
          {/* Mostrar mensaje de guardado si existe */}
          {(saveStatus.success || saveStatus.error) && (
            <div className="mb-4">
              <SaveFeedback 
                success={saveStatus.success}
                error={saveStatus.error}
                onDismiss={handleDismissFeedback}
              />
            </div>
          )}
          
          {/* Secciones */}
          <div className="tab-content">
            {activeSection === 'general' && (
              <GeneralSection 
                data={companyData} 
                onUpdate={(data) => handleSectionUpdate('general', data)}
              />
            )}
            
            {activeSection === 'contact' && (
              <ContactSection 
                data={companyData.contact || {}} 
                onUpdate={(data) => handleSectionUpdate('contact', data)}
              />
            )}
            
            {activeSection === 'hours' && (
              <BusinessHoursSection 
                data={companyData.businessHours || []} 
                onUpdate={(data) => handleSectionUpdate('businessHours', data)}
              />
            )}
            
            {activeSection === 'social' && (
              <SocialMediaSection 
                data={companyData.socialMedia || {}} 
                onUpdate={(data) => handleSectionUpdate('socialMedia', data)}
              />
            )}
            
            {activeSection === 'payment' && (
              <PaymentSection 
                data={companyData.paymentConfig || {}} 
                onUpdate={(data) => handleSectionUpdate('paymentConfig', data)}
              />
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
            <button 
              className="btn btn-outline-secondary px-4"
              onClick={() => window.location.reload()}
              disabled={saveStatus.loading}
            >
              Cancelar
            </button>
            
            <button 
              className="btn btn-dark px-4"
              onClick={() => handleSave(companyData)}
              disabled={saveStatus.loading}
            >
              {saveStatus.loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Encabezado de la página */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-title fw-medium mb-0">
          Datos de la Empresa
        </h3>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default CompanyInfoPage; 