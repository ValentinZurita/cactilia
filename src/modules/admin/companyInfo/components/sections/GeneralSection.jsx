import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../../../common/components/InputField.jsx';

/**
 * @component GeneralSection
 * @description Componente para mostrar y editar la información general de la empresa (nombre, razón social, RFC).
 * Utiliza el componente compartido `InputField` para renderizar los campos.
 */
const GeneralSection = ({ data, onUpdate }) => {
  const [generalInfo, setGeneralInfo] = useState({
    name: data.name || '',
    legalName: data.legalName || '',
    rfc: data.rfc || '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedInfo = {
      ...generalInfo,
      [name]: value
    };
    
    setGeneralInfo(updatedInfo);
    onUpdate(updatedInfo);
  };
  
  return (
    <div className="general-section">
      <div className="row g-4">
        <InputField
          id="name"
          name="name"
          label="Nombre de la Empresa"
          value={generalInfo.name}
          onChange={handleChange}
          placeholder="Ej. Cactilia"
          helpText="Este nombre será visible en toda la tienda."
          required
          colWidth="col-md-6"
        />
        <InputField
          id="legalName"
          name="legalName"
          label="Razón Social"
          value={generalInfo.legalName}
          onChange={handleChange}
          placeholder="Ej. Cactilia México S.A. de C.V."
          helpText="Nombre legal de la empresa para facturas."
          colWidth="col-md-6"
        />
        <InputField
          id="rfc"
          name="rfc"
          label="RFC"
          value={generalInfo.rfc}
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
  onUpdate: PropTypes.func.isRequired
};

export default GeneralSection; 