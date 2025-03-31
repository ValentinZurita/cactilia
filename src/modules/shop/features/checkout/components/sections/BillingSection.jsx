import { CheckoutSection } from './CheckoutSection';
import { BillingInfoForm } from '../billing/index.js'

/**
 * Sección para gestionar información fiscal y facturación
 *
 * @param {Object} props - Props del componente
 * @param {boolean} props.requiresInvoice - Si requiere factura
 * @param {Function} props.onRequiresInvoiceChange - Función para cambiar requerimiento de factura
 * @param {Object} props.fiscalData - Datos fiscales
 * @param {Function} props.onFiscalDataChange - Función para actualizar datos fiscales
 * @returns {JSX.Element} Sección de información fiscal
 */
export const BillingSection = ({
                                 requiresInvoice,
                                 onRequiresInvoiceChange,
                                 fiscalData,
                                 onFiscalDataChange
                               }) => {
  return (
    <CheckoutSection title="Información Fiscal" stepNumber={3}>
      <BillingInfoForm
        requiresInvoice={requiresInvoice}
        onRequiresInvoiceChange={onRequiresInvoiceChange}
        fiscalData={fiscalData}
        onFiscalDataChange={onFiscalDataChange}
      />
    </CheckoutSection>
  );
};