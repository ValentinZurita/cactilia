import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Definir redes sociales comunes y sus iconos
const commonNetworks = [
  { value: 'facebook', label: 'Facebook', icon: 'bi-facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'bi-instagram' },
  { value: 'twitter', label: 'Twitter/X', icon: 'bi-twitter-x' },
  { value: 'youtube', label: 'YouTube', icon: 'bi-youtube' },
  { value: 'pinterest', label: 'Pinterest', icon: 'bi-pinterest' },
  { value: 'tiktok', label: 'TikTok', icon: 'bi-tiktok' },
  { value: 'other', label: 'Otro...', icon: '' },
];

/**
 * @component AddSocialLinkForm
 * @description Formulario para añadir un nuevo enlace de red social.
 *              Incluye un dropdown para redes comunes y campos para personalización.
 */
export const AddSocialLinkForm = ({ onAdd, onCancel }) => {
  const [selectedNetwork, setSelectedNetwork] = useState('facebook');
  const [label, setLabel] = useState('Facebook');
  const [icon, setIcon] = useState('bi-facebook');
  const [url, setUrl] = useState('');
  const [showManualIcon, setShowManualIcon] = useState(false);

  // Actualizar label e icon cuando cambia el dropdown (a menos que sea 'Otro')
  const handleNetworkChange = (e) => {
    const value = e.target.value;
    setSelectedNetwork(value);
    
    if (value === 'other') {
      setLabel(''); // Limpiar label para entrada manual
      setIcon(''); // Limpiar icono para entrada manual
      setShowManualIcon(true);
    } else {
      const network = commonNetworks.find(n => n.value === value);
      setLabel(network?.label || '');
      setIcon(network?.icon || '');
      setShowManualIcon(false);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = () => {
    if (!label || !icon || !url) {
      alert('Por favor, completa la etiqueta, el icono y la URL.');
      return;
    }
    // Llamar a onAdd pasando el nuevo objeto de red social
    onAdd({ label, icon, url, visible: true }); // visible: true por defecto
  };

  return (
    <div className="add-social-form mb-4 p-3 border rounded bg-light">
      <h6 className="mb-3 border-bottom pb-2">Añadir Nueva Red Social</h6>
      
      {/* Dropdown para redes comunes */}
      <div className="mb-3">
        <label htmlFor="commonNetworkSelect" className="form-label">Red Social Común</label>
        <select 
          id="commonNetworkSelect"
          className="form-select"
          value={selectedNetwork}
          onChange={handleNetworkChange}
        >
          {commonNetworks.map(network => (
            <option key={network.value} value={network.value}>
              {network.label}
            </option>
          ))}
        </select>
      </div>

      {/* Campos para Etiqueta e Icono (manual si es 'Otro') */}
      <div className="row gx-3 mb-3">
        <div className="col-md-6">
          <label htmlFor="socialLabel" className="form-label">Etiqueta</label>
          <input
            type="text"
            id="socialLabel"
            className="form-control"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: Mi Blog"
            disabled={!showManualIcon && selectedNetwork !== 'other'} // Deshabilitado si no es 'Otro'
            required
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="socialIcon" className="form-label">Clase de Icono</label>
          <input
            type="text"
            id="socialIcon"
            className="form-control"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Ej: bi-rss-fill"
            disabled={!showManualIcon && selectedNetwork !== 'other'} // Deshabilitado si no es 'Otro'
            required
          />
           <div className="form-text">
            Usar clases de <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Bootstrap Icons</a>.
          </div>
        </div>
      </div>

      {/* Campo URL */}
      <div className="mb-3">
        <label htmlFor="socialUrl" className="form-label">URL Completa</label>
        <input
          type="url"
          id="socialUrl"
          className="form-control"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
        />
      </div>

      {/* Botones de Acción */}
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-sm btn-dark"
          onClick={handleSubmit} // Llama a handleSubmit
        >
          <i className="bi bi-plus-lg me-1" /> Añadir Enlace
        </button>
      </div>
    </div>
  );
};

AddSocialLinkForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}; 