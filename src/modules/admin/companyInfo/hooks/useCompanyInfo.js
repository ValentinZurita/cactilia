import { useState, useEffect } from 'react';
import { companyInfoService } from '../services/companyInfoService';

/**
 * Hook para obtener la información de la empresa
 * Se puede utilizar en cualquier componente que necesite acceder a estos datos
 * 
 * @returns {Object} Objeto con datos de la empresa y estado de carga
 */
export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await companyInfoService.getCompanyInfo();
        setCompanyInfo(data);
      } catch (err) {
        console.error('Error al cargar datos de la empresa:', err);
        setError('No se pudieron cargar los datos de la empresa');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyInfo();
  }, []);
  
  return { 
    companyInfo, 
    loading, 
    error,
    
    // Propiedades comúnmente accedidas para facilitar su uso
    contactEmail: companyInfo?.contact?.email || '',
    companyName: companyInfo?.name || '',
    socialMedia: companyInfo?.socialMedia || {},
    businessHours: companyInfo?.businessHours || []
  };
}; 