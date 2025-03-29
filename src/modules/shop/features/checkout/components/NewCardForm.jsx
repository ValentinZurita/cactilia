import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CardElement } from '@stripe/react-stripe-js';
import '../styles/newCardForm.css';

/**
 * Componente que muestra un formulario para ingresar los datos de una nueva tarjeta
 * durante el proceso de checkout.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onCardChange - Función que se ejecuta cuando cambia el estado de la tarjeta
 * @param {boolean} props.saveCard - Indica si se debe guardar la tarjeta para uso futuro
 * @param {Function} props.onSaveCardChange - Función para actualizar la opción de guardar tarjeta
 * @param {string} props.cardholderName - Nombre del titular de la tarjeta
 * @param {Function} props.onCardholderNameChange - Función para actualizar el nombre del titular
 */
export const NewCardForm = ({
                              onCardChange,
                              saveCard,
                              onSaveCardChange,
                              cardholderName,
                              onCardholderNameChange
                            }) => {
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Manejar cambios en el elemento de tarjeta
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setError(event.error ? event.error.message : null);

    // Notificar al componente padre sobre el estado de la tarjeta
    if (onCardChange) {
      onCardChange({
        complete: event.complete,
        error: event.error,
        empty: event.empty
      });
    }
  };

  // Opciones de estilo para el elemento de tarjeta
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
      complete: {
        iconColor: '#66bb6a'
      }
    },
    hidePostalCode: true
  };

  return (
    <div className="new-card-form">
      {/* Nombre del titular */}
      <div className="form-group mb-4">
        <label htmlFor="cardholderName" className="form-label">
          Nombre del titular
        </label>
        <input
          type="text"
          id="cardholderName"
          className="form-control"
          value={cardholderName}
          onChange={(e) => onCardholderNameChange(e.target.value)}
          placeholder="Nombre como aparece en la tarjeta"
          required
        />
      </div>

      {/* Elemento de tarjeta de Stripe */}
      <div className="form-group mb-3">
        <label className="form-label">Datos de la tarjeta</label>
        <div
          className={`card-element-container ${cardComplete ? 'is-complete' : ''} ${error ? 'is-invalid' : ''}`}
        >
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="text-danger small mt-2">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {error}
          </div>
        )}

        {/* Indicador de tarjeta completa */}
        {cardComplete && !error && (
          <div className="text-success small mt-2">
            <i className="bi bi-check-circle me-1"></i>
            Información de tarjeta válida
          </div>
        )}

        <small className="text-muted d-block mt-2">
          Ingresa el número de tarjeta, fecha de expiración y CVC
        </small>
      </div>

      {/* Opción para guardar la tarjeta */}
      <div className="form-check mt-4">
        <input
          type="checkbox"
          className="form-check-input"
          id="saveCardForFuture"
          checked={saveCard}
          onChange={(e) => onSaveCardChange(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="saveCardForFuture">
          Guardar esta tarjeta para compras futuras
        </label>
      </div>
    </div>
  );
};

NewCardForm.propTypes = {
  onCardChange: PropTypes.func.isRequired,
  saveCard: PropTypes.bool,
  onSaveCardChange: PropTypes.func.isRequired,
  cardholderName: PropTypes.string.isRequired,
  onCardholderNameChange: PropTypes.func.isRequired
};