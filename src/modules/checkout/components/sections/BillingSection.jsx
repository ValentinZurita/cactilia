import { CheckoutSection } from './CheckoutSection.jsx'
import { BillingInfoForm } from '../billing/index.js'

/**
 * Sección para gestionar información fiscal y facturación
 *
 * @param {Object} props - Props del componente
 * @param {boolean} props.requiresInvoice - Si requiere factura
 * @param {Function} props.onRequiresInvoiceChange - Función para cambiar requerimiento de factura
 * @param {Object} props.fiscalData - Datos fiscales
 * @param {Function} props.onFiscalDataChange - Función para actualizar datos fiscales
 * @param {Function} props.onFillFromShipping - Función para llenar datos desde envío
 * @returns {JSX.Element} Sección de información fiscal
 */
export const BillingSection = ({
                                 requiresInvoice,
                                 onRequiresInvoiceChange,
                                 fiscalData,
                                 onFiscalDataChange,
                                 onFillFromShipping,
                               }) => {
  return (
    <CheckoutSection title="Información Fiscal" stepNumber={4}>
      <BillingInfoForm
        requiresInvoice={requiresInvoice}
        onRequiresInvoiceChange={onRequiresInvoiceChange}
        fiscalData={fiscalData}
        onFiscalDataChange={onFiscalDataChange}
        onFillFromShipping={onFillFromShipping}
      />
    </CheckoutSection>
  )
}