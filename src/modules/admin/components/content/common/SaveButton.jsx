import  { useState } from 'react';

/**
 * Botón flotante para guardar cambios
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSave - Función a llamar al guardar
 * @param {boolean} [props.disabled] - Si el botón está deshabilitado
 * @returns {JSX.Element}
 */
export const SaveButton = ({ onSave, disabled = false }) => {

  // Estado para saber si se está guardando
  const [saving, setSaving] = useState(false);

  // Manejador para guardar
  const handleSave = async () => {
    if (disabled || saving) return;

    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };


  return (

    // Botón flotante para guardar
    <button
      className="btn btn-success rounded-circle shadow position-fixed"
      style={{
        bottom: '2rem',
        right: '2rem',
        width: '60px',
        height: '60px',
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleSave}
      title="Guardar cambios"
      disabled={disabled || saving}
    >

      {/* Icono de guardado o spinner */}
      {saving
        ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Guardando...</span>
            </div>
          )
        : (
            <i className="bi bi-check-lg"></i>
          )}

    </button>
  );
};