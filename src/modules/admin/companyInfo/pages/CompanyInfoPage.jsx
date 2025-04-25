import React from 'react';
import { SaveFeedback } from '../components/common/SaveFeedback';
import NavigationTabs from '../../common/components/NavigationTabs.jsx';
import GeneralSection from '../components/sections/GeneralSection';
import ContactSection from '../components/sections/ContactSection';
import BusinessHoursSection from '../components/sections/BusinessHoursSection';
import SocialMediaSection from '../components/sections/SocialMediaSection';
import PaymentSection from '../components/sections/PaymentSection';
import SeoSection from '../components/sections/SeoSection';
import { useCompanyInfoEditor } from '../hooks/useCompanyInfoEditor';

/**
 * Página principal para la sección de Datos de la Empresa
 * Utiliza el hook useCompanyInfoEditor para la lógica y se centra en la presentación.
 * 
 * @returns {JSX.Element} Página de datos de la empresa
 */
const CompanyInfoPage = () => {
  const {
    companyData,
    loading,
    error,
    activeSection,
    saveStatus,
    handleSave,
    handleSectionChange,
    handleSectionUpdate,
    handleDismissFeedback
  } = useCompanyInfoEditor();

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
          tabs={[
            { id: 'general', label: 'General' },
            { id: 'contact', label: 'Contacto' },
            { id: 'hours', label: 'Horarios' },
            { id: 'social', label: 'Redes Sociales' },
            { id: 'payment', label: 'Pagos' },
            { id: 'seo', label: 'SEO / Metadatos' } 
          ]}
        />
        
        <div className="p-4">
          {(saveStatus.success || saveStatus.error) && (
            <div className="mb-4">
              <SaveFeedback 
                success={saveStatus.success}
                error={saveStatus.error}
                onDismiss={handleDismissFeedback}
              />
            </div>
          )}
          
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
                data={companyData.socialMedia || { items: [] }}
                onUpdate={(data) => handleSectionUpdate('socialMedia', data)}
              />
            )}
            
            {activeSection === 'payment' && (
              <PaymentSection 
                data={companyData.paymentConfig || {}}
                onUpdate={(data) => handleSectionUpdate('paymentConfig', data)}
              />
            )}
            
            {activeSection === 'seo' && (
              <SeoSection 
                data={companyData.seo || {}}
                onUpdate={(data) => handleSectionUpdate('seo', data)}
              />
            )}
          </div>
          
          <div className="mt-4 pt-3 d-flex justify-content-end gap-2">
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