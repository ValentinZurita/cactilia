/**
 * Adapta los datos de una regla de envío (formato del servicio/backend)
 * al formato esperado por el componente ShippingForm.
 *
 * @param {object} ruleData - Los datos de la regla como vienen del servicio (e.g., selectedRule).
 * @returns {object} - Los datos adaptados para initialData del formulario.
 */
export const adaptRuleToFormData = (ruleData) => {
  if (!ruleData) {
    return {};
  }

  return {
    id: ruleData.id, // Preservar ID
    name: ruleData.zona || '',
    zipcodes: ruleData.zipcodes || [ruleData.zipcode].filter(Boolean), // Manejar ambos formatos
    activo: ruleData.activo !== undefined ? ruleData.activo : true,
    status: ruleData.activo !== undefined ? ruleData.activo : true, // Mantener consistencia si se usa 'status' en el form

    // Reglas de precio
    freeShipping: ruleData.envio_gratis || false,
    freeShippingThreshold: ruleData.envio_variable?.aplica || false,
    minOrderAmount: ruleData.envio_variable?.envio_gratis_monto_minimo || 0,

    // Métodos de envío
    shippingTypes: ruleData.opciones_mensajeria
      ? ruleData.opciones_mensajeria.map((option, index) => ({
          id: `${option.id || index + 1}`, // Usar ID si existe, sino generar uno temporal para el form
          carrier: option.nombre || '',
          label: option.label || option.nombre || '',
          price: option.precio !== undefined ? option.precio : 0,
          weight: option.peso_maximo !== undefined ? option.peso_maximo : 0,
          minDays: option.minDays !== undefined ? option.minDays : 1,
          maxDays: option.maxDays !== undefined ? option.maxDays : 3,
          usaRangosPeso: option.usaRangosPeso || false,
          rangosPeso: option.rangosPeso || [],
          maxPackageWeight: option.configuracion_paquetes?.peso_maximo_paquete !== undefined ? option.configuracion_paquetes.peso_maximo_paquete : 20,
          extraWeightCost: option.configuracion_paquetes?.costo_por_kg_extra !== undefined ? option.configuracion_paquetes.costo_por_kg_extra : 10,
          maxProductsPerPackage: option.configuracion_paquetes?.maximo_productos_por_paquete !== undefined ? option.configuracion_paquetes.maximo_productos_por_paquete : 10,
        }))
      : [],
  };
};

/**
 * Adapta los datos del formulario (formato de ShippingForm)
 * al formato esperado por el servicio/backend para crear/actualizar una regla.
 *
 * @param {object} formData - Los datos tal como vienen del formulario.
 * @returns {object} - Los datos adaptados para el payload del servicio.
 */
export const adaptFormDataToRulePayload = (formData) => {
  return {
    // Datos básicos
    // Usar el primer zipcode como el principal si existe, sino vacío.
    zipcode: formData.zipcodes && formData.zipcodes.length > 0 ? formData.zipcodes[0] : '',
    zipcodes: formData.zipcodes || [],
    zona: formData.name || '',
    // Asegurarse de que 'activo' sea booleano.
    activo: formData.activo !== undefined ? Boolean(formData.activo) : true,

    // Métodos de envío
    opciones_mensajeria: formData.shippingTypes
      ? formData.shippingTypes.map(type => ({
          // No enviar el ID temporal del formulario al backend
          nombre: type.carrier,
          label: type.label,
          precio: type.price !== undefined ? Number(type.price) : 0,
          peso_maximo: type.weight !== undefined ? Number(type.weight) : 0,
          // Reconstruir tiempo_entrega si el backend lo espera, aunque es mejor usar min/max
          tiempo_entrega: `${type.minDays}-${type.maxDays} días`,
          minDays: type.minDays !== undefined ? Number(type.minDays) : 1,
          maxDays: type.maxDays !== undefined ? Number(type.maxDays) : 3,
          usaRangosPeso: type.usaRangosPeso || false,
          // Asegurarse de que los precios en rangos sean números
          rangosPeso: (type.rangosPeso || []).map(r => ({ ...r, price: Number(r.price) })),
          configuracion_paquetes: {
            peso_maximo_paquete: type.maxPackageWeight !== undefined ? Number(type.maxPackageWeight) : 20,
            costo_por_kg_extra: type.extraWeightCost !== undefined ? Number(type.extraWeightCost) : 10,
            maximo_productos_por_paquete: type.maxProductsPerPackage !== undefined ? Number(type.maxProductsPerPackage) : 10,
          }
        }))
      : [],

    // Reglas de precio
    envio_gratis: formData.freeShipping || false,
    // precio_base no parece usarse en el formulario, mantenerlo si es necesario para backend
    precio_base: 0,

    // Otras propiedades
    envio_variable: {
      aplica: !!formData.freeShippingThreshold,
      // Asegurarse de que el monto mínimo sea número
      envio_gratis_monto_minimo: formData.minOrderAmount !== undefined ? Number(formData.minOrderAmount) : 0,
      costo_por_producto_extra: 0 // Mantener si es necesario para backend
    }
    // No incluir el 'id' o 'status' del formulario en el payload
  };
}; 