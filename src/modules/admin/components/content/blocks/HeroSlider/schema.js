/**
 * Esquema para el bloque de tipo Hero Slider
 * Define todos los campos que puede tener el bloque y sus propiedades
 */
export const heroSliderSchema = {
  // Campos de texto
  title: {
    type: 'text',
    label: 'Título principal',
    placeholder: 'Ingresa el título principal',
    defaultValue: 'Bienvenido a Cactilia',
    help: 'El título que aparecerá destacado en el hero'
  },
  subtitle: {
    type: 'text',
    label: 'Subtítulo',
    placeholder: 'Ingresa el subtítulo o descripción',
    defaultValue: 'Productos frescos y naturales para una vida mejor',
    help: 'Un texto descriptivo que aparece bajo el título'
  },

  // Campos de botón
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

  // Configuración del slider
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
    help: 'Altura que ocupará el slider en la pantalla'
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

  // Media
  mainImage: {
    type: 'media',
    label: 'Imagen principal',
    defaultValue: '/public/images/placeholder.jpg',
    help: 'Se usará si no hay una colección seleccionada'
  },
  collectionId: {
    type: 'media',
    label: 'Colección de imágenes',
    isCollection: true,
    help: 'Si seleccionas una colección, se usarán todas sus imágenes'
  },

  // Opciones de visualización
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