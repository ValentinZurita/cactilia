import { CheckoutSection } from './CheckoutSection.jsx'

/**
 * Sección para notas adicionales del pedido
 *
 * @param {Object} props - Props del componente
 * @param {string} props.notes - Notas del pedido
 * @param {Function} props.onNotesChange - Función para actualizar notas
 * @returns {JSX.Element} Sección de notas
 */
export const NotesSection = ({ notes, onNotesChange }) => {
  return (
    <CheckoutSection title="Notas Adicionales" stepNumber={5}>
      <div className="form-group">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Instrucciones especiales para la entrega (opcional)"
          value={notes}
          onChange={onNotesChange}
          aria-label="Notas adicionales para el pedido"
        ></textarea>
        <small className="form-text text-muted">
          Por ejemplo: "Dejar con el portero" o "Llamar antes de entregar".
        </small>
      </div>
    </CheckoutSection>
  )
}