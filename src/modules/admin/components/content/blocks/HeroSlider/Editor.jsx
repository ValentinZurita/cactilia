import { useState } from 'react';
import {
  FieldText,
  FieldToggle,
  FieldSelect,
  FieldNumber,
  FieldMedia
} from '../../common/FormFields';

/**
 * Editor mejorado para el bloque Hero Slider
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque a editar
 * @param {Function} props.onChange - Función para actualizar el bloque
 * @param {Function} props.onMediaSelect - Función para abrir el selector de medios
 * @returns {JSX.Element}
 */
export const HeroSliderEditor = ({ block, onChange, onMediaSelect }) => {
  // Estado local para una mejor experiencia de usuario
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Verificar que el bloque tenga los datos mínimos
  if (!block || block.type !== 'hero-slider') {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error: Este editor es para bloques de tipo "hero-slider"
      </div>
    );
  }

  // Definición de schema (simplificado para hacer el código más directo)
  const schema = {
    title: {
      type: 'text',
      label: 'Título principal',
      placeholder: 'Ingresa el título principal',
      help: 'El título que aparecerá destacado en el hero'
    },
    subtitle: {
      type: 'text',
      label: 'Subtítulo',
      placeholder: 'Ingresa el subtítulo o descripción',
      help: 'Un texto descriptivo que aparece bajo el título'
    },
    buttonText: {
      type: 'text',
      label: 'Texto del botón',
      placeholder: 'Ej: Conoce más',
      defaultValue: 'Conoce Más',
      help: 'El texto que se mostrará en el botón de acción'
    },
    buttonLink: {
      type: 'text',
      label: 'Enlace del botón',
      placeholder: 'Ej: /productos',
      defaultValue: '#',
      help: 'URL a la que dirigirá el botón'
    },
    showButton: {
      type: 'toggle',
      label: 'Mostrar botón',
      defaultValue: true,
      help: 'Activa o desactiva la visibilidad del botón'
    },
    height: {
      type: 'select',
      label: 'Altura',
      defaultValue: '100vh',
      options: [
        ['25vh', '25% de la pantalla'],
        ['50vh', '50% de la pantalla'],
        ['75vh', '75% de la pantalla'],
        ['100vh', 'Pantalla completa']
      ],
      help: 'Altura que ocupará el hero en la pantalla'
    },
    autoRotate: {
      type: 'toggle',
      label: 'Rotación automática',
      defaultValue: true,
      help: 'Las imágenes cambian automáticamente'
    },
    interval: {
      type: 'number',
      label: 'Intervalo (ms)',
      defaultValue: 5000,
      min: 1000,
      max: 10000,
      step: 500,
      help: 'Tiempo entre imágenes en milisegundos'
    },
    mainImage: {
      type: 'media',
      label: 'Imagen principal',
      help: 'Se usará si no hay una colección seleccionada'
    },
    collectionId: {
      type: 'media',
      label: 'Colección de imágenes',
      isCollection: true,
      help: 'Si seleccionas una colección, se usarán todas sus imágenes'
    },
    showLogo: {
      type: 'toggle',
      label: 'Mostrar logo',
      defaultValue: true,
      help: 'Muestra el logo de la empresa en el hero'
    },
    showSubtitle: {
      type: 'toggle',
      label: 'Mostrar subtítulo',
      defaultValue: true,
      help: 'Activa o desactiva la visibilidad del subtítulo'
    }
  };

  // Manejar cambios en los campos
  const handleFieldChange = (fieldName, value) => {
    onChange({ [fieldName]: value });
  };

  return (
    <div className="hero-slider-editor">
      <div className="p-4 bg-light border rounded mb-4">
        <h5 className="mb-3 border-bottom pb-2">Configuración del Hero</h5>
        <p className="text-muted">
          El Hero es la primera sección que ven los usuarios al entrar a tu sitio.
          Personaliza el título, subtítulo, botón e imagen para captar la atención de tus visitantes.
        </p>
      </div>

      <div className="row">
        <div className="col-12">
          <h6 className="text-muted mb-3 border-bottom pb-2">
            <i className="bi bi-type me-2"></i>
            Textos principales
          </h6>

          {/* Campos de texto */}
          <FieldText
            name="title"
            label={schema.title.label}
            value={block.title || ''}
            onChange={(value) => handleFieldChange('title', value)}
            placeholder={schema.title.placeholder}
            help={schema.title.help}
          />

          <FieldText
            name="subtitle"
            label={schema.subtitle.label}
            value={block.subtitle || ''}
            onChange={(value) => handleFieldChange('subtitle', value)}
            placeholder={schema.subtitle.placeholder}
            help={schema.subtitle.help}
          />
        </div>

        <div className="col-12">
          <h6 className="text-muted mb-3 border-bottom pb-2 mt-4">
            <i className="bi bi-images me-2"></i>
            Imagen de fondo
          </h6>

          {/* Campos de media */}
          <FieldMedia
            name="mainImage"
            label={schema.mainImage.label}
            value={block.mainImage || ''}
            onChange={(value) => handleFieldChange('mainImage', value)}
            onBrowse={() => onMediaSelect('mainImage')}
            help={schema.mainImage.help}
          />
        </div>

        <div className="col-md-6">
          <h6 className="text-muted mb-3 border-bottom pb-2 mt-4">
            <i className="bi bi-toggles me-2"></i>
            Opciones del botón
          </h6>

          {/* Botón de acción */}
          <FieldToggle
            name="showButton"
            label={schema.showButton.label}
            checked={block.showButton !== undefined ? block.showButton : schema.showButton.defaultValue}
            onChange={(value) => handleFieldChange('showButton', value)}
            help={schema.showButton.help}
          />

          {/* Mostrar campos del botón solo si showButton está activo */}
          {block.showButton && (
            <>
              <FieldText
                name="buttonText"
                label={schema.buttonText.label}
                value={block.buttonText || schema.buttonText.defaultValue}
                onChange={(value) => handleFieldChange('buttonText', value)}
                placeholder={schema.buttonText.placeholder}
                help={schema.buttonText.help}
              />

              <FieldText
                name="buttonLink"
                label={schema.buttonLink.label}
                value={block.buttonLink || schema.buttonLink.defaultValue}
                onChange={(value) => handleFieldChange('buttonLink', value)}
                placeholder={schema.buttonLink.placeholder}
                help={schema.buttonLink.help}
              />
            </>
          )}
        </div>

        <div className="col-md-6">
          <h6 className="text-muted mb-3 border-bottom pb-2 mt-4">
            <i className="bi bi-toggles me-2"></i>
            Opciones de visualización
          </h6>

          {/* Campos de visualización */}
          <FieldToggle
            name="showLogo"
            label={schema.showLogo.label}
            checked={block.showLogo !== undefined ? block.showLogo : schema.showLogo.defaultValue}
            onChange={(value) => handleFieldChange('showLogo', value)}
            help={schema.showLogo.help}
          />

          <FieldToggle
            name="showSubtitle"
            label={schema.showSubtitle.label}
            checked={block.showSubtitle !== undefined ? block.showSubtitle : schema.showSubtitle.defaultValue}
            onChange={(value) => handleFieldChange('showSubtitle', value)}
            help={schema.showSubtitle.help}
          />
        </div>

        {/* Sección colapsable de opciones avanzadas */}
        <div className="col-12 mt-4">
          <button
            type="button"
            className="btn btn-link text-decoration-none px-0"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <i className={`bi bi-chevron-${showAdvancedOptions ? 'up' : 'down'} me-2`}></i>
            Opciones avanzadas
          </button>

          {showAdvancedOptions && (
            <div className="bg-light p-3 rounded mt-2">
              <div className="row">
                <div className="col-md-6">
                  <FieldSelect
                    name="height"
                    label={schema.height.label}
                    value={block.height || schema.height.defaultValue}
                    onChange={(value) => handleFieldChange('height', value)}
                    options={schema.height.options}
                    help={schema.height.help}
                  />
                </div>

                <div className="col-md-6">
                  <FieldToggle
                    name="autoRotate"
                    label={schema.autoRotate.label}
                    checked={block.autoRotate !== undefined ? block.autoRotate : schema.autoRotate.defaultValue}
                    onChange={(value) => handleFieldChange('autoRotate', value)}
                    help={schema.autoRotate.help}
                  />

                  {block.autoRotate && (
                    <FieldNumber
                      name="interval"
                      label={schema.interval.label}
                      value={block.interval || schema.interval.defaultValue}
                      onChange={(value) => handleFieldChange('interval', value)}
                      min={schema.interval.min}
                      max={schema.interval.max}
                      step={schema.interval.step}
                      help={schema.interval.help}
                    />
                  )}
                </div>

                <div className="col-12 mt-3">
                  <FieldMedia
                    name="collectionId"
                    label={schema.collectionId.label}
                    value={block.collectionId || ''}
                    onChange={(value) => handleFieldChange('collectionId', value)}
                    onBrowse={() => onMediaSelect('collectionId')}
                    isCollection
                    help={schema.collectionId.help}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};