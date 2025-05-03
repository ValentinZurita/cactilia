// Intenta extraer calle, número exterior e interior de un string tipo: "Calle #123, Int. 4B"
export function parseStreetData(originalStreet = '') {
  let street = originalStreet;
  let numExt = '';
  let numInt = '';
  const match = street.match(/(.*?)(?:\s+#?(\d+)(?:\s*,\s*#?(\d+))?)?$/);
  if (match) {
    street = match[1]?.trim() || '';
    numExt = match[2] || '';
    numInt = match[3] || '';
  }
  return { street, numExt, numInt };
}

// Valida los campos requeridos y formato de código postal (5 dígitos).
export function validateFormData(data) {
  const errors = {};
  if (!data.fullName?.trim()) errors.fullName = 'El nombre completo es requerido';
  if (!data.phone?.trim()) errors.phone = 'El teléfono es requerido';
  else if (!/^\d{10}$/.test(data.phone.trim())) {
    errors.phone = 'El teléfono debe tener 10 dígitos';
  }
  if (!data.street?.trim()) errors.street = 'La calle es requerida';
  if (!data.numExt?.trim()) errors.numExt = 'El número exterior es requerido';
  if (!data.colonia?.trim()) errors.colonia = 'La colonia es requerida';
  if (!data.city?.trim()) errors.city = 'La ciudad es requerida';
  if (!data.state?.trim()) errors.state = 'El estado es requerido';
  if (!data.zip?.trim()) errors.zip = 'El código postal es requerido';
  else if (!/^\d{5}$/.test(data.zip.trim())) {
    errors.zip = 'El código postal debe tener 5 dígitos';
  }
  return errors;
}