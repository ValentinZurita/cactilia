import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../../../common/components/InputField.jsx';

/**
 * @component GeneralSection
 * @description Componente para mostrar y editar la información general de la empresa (nombre, razón social, RFC).
 * Utiliza el componente compartido `InputField` para renderizar los campos.
 */
const GeneralSection = ({ data, onFieldChange }) => {
  // const [generalInfo, setGeneralInfo] = useState({ ... });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    // REMOVE local state update: setGeneralInfo(...);
    onFieldChange(name, value);
  };
  
  return (
    <div className="general-section">
      <div className="row g-4">
        <InputField
          id="name"
          name="name"
          label="Nombre de la Empresa"
          value={data?.name || ''}
          onChange={handleChange}
          placeholder="Ej. Cactilia"
          helpText="Este nombre será visible en toda la tienda."
          required
          colWidth="col-md-6"
        />
        <InputField
          id="navbarBrandText"
          name="navbarBrandText"
          label="Texto para Barra de Navegación"
          value={data?.navbarBrandText || ''}
          onChange={handleChange}
          placeholder="Ej. Cactilia (o dejar en blanco para usar Nombre Empresa)"
          helpText="Texto que se muestra en la esquina superior izquierda. Si se deja vacío, usa el Nombre de la Empresa."
          colWidth="col-md-6"
        />
        <InputField
          id="legalName"
          name="legalName"
          label="Razón Social"
          value={data?.legalName || ''}
          onChange={handleChange}
          placeholder="Ej. Cactilia México S.A. de C.V."
          helpText="Nombre legal de la empresa para facturas."
          colWidth="col-md-6"
        />
        <InputField
          id="rfc"
          name="rfc"
          label="RFC"
          value={data?.rfc || ''}
          onChange={handleChange}
          placeholder="Ej. CACT010101AAA"
          helpText="Registro Federal de Contribuyentes."
          colWidth="col-md-6"
        />
      </div>
    </div>
  );
};

GeneralSection.propTypes = {
  data: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired
};

export default GeneralSection; 