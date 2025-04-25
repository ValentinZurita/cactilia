import { useState, useEffect } from 'react';
import { companyInfoService } from '../services/companyInfoService';
import { getSocialMediaLinks, updateSocialMediaLinks } from '../../../../services/firebase/companyInfoService.js';

/**
 * Hook para manejar la lógica de edición de la información de la empresa.
 * Encapsula el estado, la carga de datos y las operaciones de guardado.
 */
export function useCompanyInfoEditor() {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('general'); // Pestaña inicial
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
        
        // 1. Fetch general company info
        const generalData = await companyInfoService.getCompanyInfo();
        
        // 2. Fetch social media links separately
        const socialLinks = await getSocialMediaLinks();
        
        // 3. Combine the data
        setCompanyData({ 
          ...generalData, 
          socialMedia: { items: socialLinks } // Store social links under socialMedia.items
        });

      } catch (err) {
        console.error('Error loading company data:', err);
        setError('No se pudieron cargar los datos de la empresa');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  // Ocultar mensaje de éxito/error después de un tiempo
  useEffect(() => {
    let timer;
    if (saveStatus.success || saveStatus.error) {
      timer = setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, success: false, error: null }));
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveStatus.success, saveStatus.error]);


  /**
   * Guardar los datos de la empresa (ambos, general y social)
   * @param {Object} companyDataToSave - Datos completos de la empresa desde el estado local
   */
  const handleSave = async (companyDataToSave) => {
    setSaveStatus({ success: false, error: null, loading: true });
    let saveError = null;
    let generalSaveSuccess = false;
    let socialSaveSuccess = false;

    try {
      // 1. Extraer enlaces sociales y preparar datos generales
      const socialLinksToSave = companyDataToSave.socialMedia?.items || [];
      const generalDataToSave = { ...companyDataToSave };
      delete generalDataToSave.socialMedia;

      // 2. Guardar datos generales (settings/company_info)
      console.log('Guardando datos generales:', generalDataToSave);
      await companyInfoService.saveCompanyInfo(generalDataToSave);
      generalSaveSuccess = true;
      console.log('Datos generales guardados.');

      // 3. Guardar enlaces sociales (companyInfo/socialMedia)
      console.log('Guardando enlaces sociales:', socialLinksToSave);
      socialSaveSuccess = await updateSocialMediaLinks(socialLinksToSave);
      if (!socialSaveSuccess) {
        throw new Error('No se pudieron guardar los enlaces de redes sociales.');
      }
      console.log('Enlaces sociales guardados.');

      // 4. Actualizar estado local SÓLO si todo fue exitoso (redundante si ya está actualizado?)
      // setCompanyData(companyDataToSave); // El estado ya debería estar actualizado por handleSectionUpdate

      // 5. Mostrar mensaje de éxito
      setSaveStatus({ 
        success: 'Los datos de la empresa se han guardado correctamente', 
        error: null, 
        loading: false 
      });
      
    } catch (err) {
      console.error('Error saving company data:', err);
      saveError = `Error al guardar: ${err.message || 'Error desconocido'}`;
      if (!generalSaveSuccess) {
        saveError += ' (Error en datos generales)';
      } else if (!socialSaveSuccess) {
        saveError += ' (Error en redes sociales)';
      }
      setSaveStatus({ 
        success: false, 
        error: saveError, 
        loading: false 
      });
    }
  };

  /**
   * Cambiar la pestaña activa
   */
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  /**
   * Actualizar una sección específica de los datos en el estado local
   */
  const handleSectionUpdate = (sectionName, sectionData) => {
    if (!companyData) return;
    console.log(`Actualizando estado local para sección: ${sectionName}`, sectionData);
    setCompanyData(prevData => ({
      ...prevData,
      [sectionName]: sectionData
    }));
  };

  /**
   * Actualizar un campo individual de nivel superior en el estado local
   */
  const handleFieldChange = (fieldName, value) => {
    if (!companyData) return;
    console.log(`Actualizando campo: ${fieldName} = ${value}`);
    setCompanyData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
  };

  /**
   * Ocultar mensajes de retroalimentación
   */
  const handleDismissFeedback = () => {
    setSaveStatus({
      success: false,
      error: null,
      loading: false // Asegurarse de resetear loading también
    });
  };

  return {
    companyData,
    loading,
    error,
    activeSection,
    saveStatus,
    handleSave,
    handleSectionChange,
    handleSectionUpdate,
    handleFieldChange,
    handleDismissFeedback
  };
} 