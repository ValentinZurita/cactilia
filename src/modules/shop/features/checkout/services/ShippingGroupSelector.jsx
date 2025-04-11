  // Grupo especial: opciones gratuitas que cubren todos los productos
  const freeOptions = options.filter(option => 
    !option.isFallback &&
    option.price === 0 &&
    (option.combination?.isComplete || option.coversAllProducts) &&
    !processedOptionIds.has(option.id || option.optionId)
  );
  
  if (freeOptions.length > 0) {
    freeOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
    
    groups.push({
      id: 'free_shipping',
      title: 'Envío gratuito',
      subtitle: 'Todas tus compras sin costo de envío',
      options: freeOptions,
      icon: 'bi-gift'
    });
  }
  
  // Grupos por tipo de zona
  zoneTypes.forEach(zoneType => {
    // Filtrar opciones no gratuitas de este tipo y que no sean fallback
    // y que no hayan sido procesadas ya
    const typeOptions = options.filter(option => {
      const optionId = option.id || option.optionId;
      
      if (option.isFallback || processedOptionIds.has(optionId)) {
        return false;
      }
      
      if ((option.type && option.type.toLowerCase() === zoneType) ||
          (option.zoneName && option.zoneName.toLowerCase() === zoneType)) {
        return true;
      }
      return false;
    });
    
    // Solo añadir si hay opciones
    if (typeOptions.length > 0) {
      typeOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
      
      // Nombre bonito para el tipo de zona
      let title = '';
      let icon = '';
      let subtitle = '';
      
      if (zoneType.includes('local')) {
        title = 'Envío local';
        subtitle = 'Opciones para productos con envío en tu zona';
        icon = 'bi-pin-map';
      } else if (zoneType.includes('nacional') || zoneType.includes('national')) {
        title = 'Envío nacional';
        subtitle = 'Opciones para productos con envío a nivel nacional';
        icon = 'bi-truck';
      } else if (zoneType.includes('internacional') || zoneType.includes('international')) {
        title = 'Envío internacional';
        subtitle = 'Opciones para envío fuera del país';
        icon = 'bi-globe';
      } else {
        // Si es otro tipo que no reconocemos, usar el nombre directamente
        // Primera letra en mayúscula y resto en minúscula
        const formattedType = zoneType.charAt(0).toUpperCase() + zoneType.slice(1).toLowerCase();
        title = `Envío ${formattedType}`;
        subtitle = `Opciones de envío para servicio ${formattedType}`;
        icon = 'bi-box';
      }
      
      groups.push({
        id: `zone_${zoneType}`,
        title,
        subtitle,
        options: typeOptions,
        icon
      });
    }
  });
  
  // Grupo especial para las combinaciones Local+Nacional
  const localNationalOptions = options.filter(option => 
    !option.isFallback && 
    !processedOptionIds.has(option.id || option.optionId) &&
    option.type === 'local_national'
  );
  
  if (localNationalOptions.length > 0) {
    localNationalOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
    
    groups.push({
      id: 'local_national_shipping',
      title: 'Envío Local y Nacional',
      subtitle: 'Combinaciones que incluyen múltiples servicios de envío',
      options: localNationalOptions,
      icon: 'bi-truck'
    });
  }
  
  // Grupo especial: combinaciones (opciones que usan múltiples servicios)
  const combinedOptions = options.filter(option => 
    !option.isFallback &&
    !processedOptionIds.has(option.id || option.optionId) &&
    (option.type === 'combined' || 
     (option.combination && option.combination.options && option.combination.options.length > 1))
  );
  
  if (combinedOptions.length > 0) {
    combinedOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
    
    groups.push({
      id: 'combined_shipping',
      title: 'Combinaciones de envío',
      subtitle: 'Opciones que combinan diferentes métodos para todos tus productos',
      options: combinedOptions,
      icon: 'bi-box-seam'
    });
  } 