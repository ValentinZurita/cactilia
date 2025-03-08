import { heroSliderSchema } from './schema';
import {
  FieldText,
  FieldToggle,
  FieldSelect,
  FieldNumber,
  FieldMedia
} from '../../common/FormFields';

/**
 * Editor para el bloque Hero Slider
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque a editar
 * @param {Function} props.onChange - Función para actualizar el bloque
 * @param {Function} props.onMediaSelect - Función para abrir el selector de medios
 * @returns {JSX.Element}
 */
export const HeroSliderEditor = ({ block, onChange, onMediaSelect }) => {
  // Verificar que el bloque tenga los datos mínimos
  if (!block || block.type !== 'hero-slider') {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error: Este editor es para bloques de tipo "hero-slider"
      </div>
    );
  }

  // Extraer schema
  const schema = heroSliderSchema;

  // Manejar cambios en los campos
  const handleFieldChange = (fieldName, value) => {
    onChange({ [fieldName]: value });
  };

  return (
    <div className="hero-slider-editor">
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
            Imágenes
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

        <div className="col-md-6">
          <h6 className="text-muted mb-3 border-bottom pb-2 mt-4">
            <i className="bi bi-sliders me-2"></i>
            Configuración
          </h6>

          {/* Campos de configuración */}
          <FieldSelect
            name="height"
            label={schema.height.label}
            value={block.height || schema.height.defaultValue}
            onChange={(value) => handleFieldChange('height', value)}
            options={schema.height.options}
            help={schema.height.help}
          />

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
      </div>
    </div>
  );
};