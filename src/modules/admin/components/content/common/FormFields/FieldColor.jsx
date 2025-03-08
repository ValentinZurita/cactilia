// src/modules/admin/components/content/common/FormFields/FieldColor.jsx
import React, { useState } from 'react';

/**
 * Campo para seleccionar colores
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.value - Valor actual (código de color)
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {Array} [props.presetColors] - Colores predefinidos para selección rápida
 * @param {string} [props.help] - Texto de ayuda
 * @returns {JSX.Element}
 */
export const FieldColor = ({
                             name,
                             label,
                             value = '#000000',
                             onChange,
                             presetColors = [
                               '#3b82f6', // Azul
                               '#10b981', // Verde
                               '#ef4444', // Rojo
                               '#f59e0b', // Ámbar
                               '#8b5cf6', // Violeta
                               '#ec4899', // Rosa
                               '#6b7280'  // Gris
                             ],
                             help = '',
                             disabled = false
                           }) => {
  // Estado para mostrar/ocultar el selector de color
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label d-flex justify-content-between align-items-center">
        <span>{label}</span>
        <span
          className="color-preview rounded"
          style={{
            backgroundColor: value,
            width: '20px',
            height: '20px',
            display: 'inline-block',
            border: '1px solid #dee2e6'
          }}
          title={value}
        ></span>
      </label>

      {/* Colores predefinidos */}
      <div className="preset-colors d-flex flex-wrap gap-2 mb-2">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className="btn p-0 border-0 color-preset"
            style={{
              backgroundColor: color,
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: value === color ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              boxShadow: value === color ? '0 0 0 2px white' : 'none',
              opacity: disabled ? 0.5 : 1
            }}
            onClick={() => !disabled && onChange(color)}
            title={color}
            disabled={disabled}
          />
        ))}

        {/* Botón para abrir/cerrar el selector */}
        <button
          type="button"
          className="btn p-0 border-0 color-preset d-flex align-items-center justify-content-center"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1
          }}
          onClick={() => !disabled && setShowPicker(!showPicker)}
          title={showPicker ? "Cerrar selector" : "Más colores"}
          disabled={disabled}
        >
          <i className={`bi bi-${showPicker ? 'x' : 'plus'} small`}></i>
        </button>
      </div>

      {/* Selector de color nativo */}
      {showPicker && (
        <div className="color-picker-container mb-2">
          <input
            type="color"
            id={name}
            name={name}
            className="form-control form-control-color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            title="Elegir color"
            disabled={disabled}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Valor actual en formato hexadecimal */}
      <div className="input-group input-group-sm">
        <span className="input-group-text">Hex</span>
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          disabled={disabled}
        />
      </div>

      {/* Texto de ayuda */}
      {help && <div className="form-text text-muted small mt-1">{help}</div>}
    </div>
  );
};