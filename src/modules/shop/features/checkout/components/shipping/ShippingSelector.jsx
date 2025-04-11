import React, { useState, useEffect, useContext } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../../config/firebase/firebaseConfig';
import ShippingGroupSelector from './ShippingGroupSelector';
import { allProductsCovered } from '../../services/ShippingRuleService';

/**
 * Componente adaptador para el selector de envío
 * Conecta con Firebase para obtener las reglas de envío y pasarlas correctamente al ShippingGroupSelector
 */
const ShippingSelector = ({ 
  cartItems, 
  onOptionSelect, 
  selectedOptionId,
  selectedOptionDesc,
  userAddress,
  onCombinationsCalculated
}) => {
  // Estado local para las reglas de envío
  const [shippingRules, setShippingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [incompleteShipping, setIncompleteShipping] = useState(false);
  const [filteredShippingRules, setFilteredShippingRules] = useState([]);
  
  // Efecto para cargar las reglas directamente desde Firebase
  useEffect(() => {
    const fetchShippingRulesFromFirebase = async () => {
      try {
        console.log('🔍 Cargando reglas de envío desde Firebase...');
        setLoading(true);
        
        // Intentar cargar de zonas_envio (colección principal)
        const shippingZonesCollection = collection(FirebaseDB, 'zonas_envio');
        const zonesQuery = query(shippingZonesCollection, where('activo', '==', true));
        
        const zonesSnapshot = await getDocs(zonesQuery);
        
        if (zonesSnapshot.empty) {
          console.warn('⚠️ No se encontraron reglas de envío activas en zonas_envio');
          setError('No hay reglas de envío configuradas');
          setLoading(false);
          return;
        }
        
        // Procesar documentos
        const rules = [];
        zonesSnapshot.forEach(doc => {
          const ruleData = doc.data();
          
          // Verificar y formatear las opciones para asegurarnos que tienen la estructura correcta
          let opciones = [];
          
          // Si hay opciones_mensajeria, usarlas
          if (ruleData.opciones_mensajeria && Array.isArray(ruleData.opciones_mensajeria)) {
            opciones = ruleData.opciones_mensajeria;
          } 
          // Si hay opciones, usarlas como alternativa
          else if (ruleData.opciones && Array.isArray(ruleData.opciones)) {
            opciones = ruleData.opciones;
          }
          // Si no hay opciones definidas, crear una predeterminada basada en la zona
          else {
            console.log(`⚠️ Regla ${doc.id} (${ruleData.zona}) no tiene opciones definidas, creando opción predeterminada`);
            opciones = [{
              nombre: `Envío ${ruleData.zona}`,
              precio: ruleData.envio_gratis ? 0 : 200,
              tiempoEntrega: "3-5 días",
              id: `default-option-${doc.id}`
            }];
          }
          
          // Asegurarse de que cada opción tenga un ID
          opciones = opciones.map((opcion, index) => ({
            ...opcion,
            id: opcion.id || `${doc.id}-option-${index + 1}`
          }));
          
          // Añadir la regla procesada
          rules.push({
            id: doc.id,
            ...ruleData,
            opciones: opciones,
            opciones_mensajeria: opciones
          });
        });
        
        console.log(`✅ Se cargaron ${rules.length} reglas de envío:`, rules);
        setShippingRules(rules);
        
        // También guardarlas en window.__SHIPPING_RULES__ para compatibilidad
        window.__SHIPPING_RULES__ = rules;
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error al cargar reglas de envío:', error);
        setError(`Error al cargar las reglas de envío: ${error.message}`);
        setLoading(false);
        
        // Si hay un error, intentar usar reglas predeterminadas
        createFallbackRules();
      }
    };
    
    // Crear reglas de respaldo en caso de error
    const createFallbackRules = () => {
      console.warn('⚠️ Usando reglas de envío de respaldo');
      
      // Reglas predeterminadas basadas en la información del debug panel
      const fallbackRules = [
        {
          id: "x8tRGxol2MOr8NMzeAPp",
          zona: "Local",
          activo: true,
          envio_gratis: true,
          opciones: [
            {
              id: "x8tRGxol2MOr8NMzeAPp-option-1",
              nombre: "Entrega local",
              precio: 0,
              tiempoEntrega: "1-1 días"
            }
          ],
          opciones_mensajeria: [
            {
              id: "x8tRGxol2MOr8NMzeAPp-option-1",
              nombre: "Entrega local",
              precio: 0,
              tiempoEntrega: "1-1 días"
            }
          ]
        },
        {
          id: "fyfkhfITejBjMASFCMZ2",
          zona: "Nacional",
          activo: true,
          envio_gratis: false,
          opciones: [
            {
              id: "fyfkhfITejBjMASFCMZ2-option-1",
              nombre: "Correos de México",
              precio: 200,
              tiempoEntrega: "3-10 días"
            },
            {
              id: "fyfkhfITejBjMASFCMZ2-option-2",
              nombre: "Correos de México",
              precio: 350,
              tiempoEntrega: "1-3 días"
            }
          ],
          opciones_mensajeria: [
            {
              id: "fyfkhfITejBjMASFCMZ2-option-1",
              nombre: "Correos de México",
              precio: 200,
              tiempoEntrega: "3-10 días"
            },
            {
              id: "fyfkhfITejBjMASFCMZ2-option-2",
              nombre: "Correos de México",
              precio: 350,
              tiempoEntrega: "1-3 días"
            }
          ]
        }
      ];
      
      setShippingRules(fallbackRules);
      window.__SHIPPING_RULES__ = fallbackRules;
    };
    
    // Ejecutar la función de carga
    fetchShippingRulesFromFirebase();
  }, []);

  // Manejar selección de opción y verificar cobertura completa
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Verificar si esta opción cubre todos los productos
    if (option && option.selections) {
      const allCovered = allProductsCovered(option.selections, cartItems);
      setIncompleteShipping(!allCovered);
      
      console.log(`🔍 Opción de envío seleccionada: ${option.id}`);
      console.log(`📦 ¿Cubre todos los productos?: ${allCovered ? 'SÍ' : 'NO'}`);
    }
    
    // Llamar al callback original
    onOptionSelect(option);
  };

  // Callback para recibir las combinaciones calculadas
  const handleCombinationsCalculated = (combinations) => {
    // Verificar que las combinaciones sean un array válido
    if (!combinations || !Array.isArray(combinations)) {
      console.warn('⚠️ Se recibieron combinaciones inválidas o nulas');
      // Pasar array vacío al componente padre para evitar errores
      if (onCombinationsCalculated) {
        onCombinationsCalculated([]);
      }
      return;
    }
    
    console.log(`📦 Total combinaciones recibidas: ${combinations.length}`);
    
    // En lugar de filtrar, pasamos todas las combinaciones y dejaremos que el componente
    // ShippingGroupSelector las organice por zonas
    if (onCombinationsCalculated) {
      onCombinationsCalculated(combinations);
    }
  };

  // Log del estado actual
  console.log('📦 ShippingSelector: Rendering with props', { 
    cartItemsCount: cartItems?.length || 0,
    hasAddress: !!userAddress,
    shippingRulesCount: shippingRules.length,
    userAddressZip: userAddress?.zip || userAddress?.zipcode
  });
  
  if (loading) {
    return (
      <div className="shipping-selector__loading">
        <p>Cargando reglas de envío...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="shipping-selector__error">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <>
      <ShippingGroupSelector
        cartItems={cartItems}
        onOptionSelect={handleOptionSelect}
        selectedOptionId={selectedOptionId}
        selectedOptionDesc={selectedOptionDesc}
        userAddress={userAddress}
        onCombinationsCalculated={handleCombinationsCalculated}
        shippingRules={shippingRules}
        filterOnlyComplete={false} // No filtrar, mostrar todas las opciones
        groupByZone={true} // Nuevo prop para agrupar por zonas
      />
      
      {incompleteShipping && (
        <div className="alert alert-warning mt-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Envío incompleto:</strong> La opción seleccionada no cubre todos los productos de tu carrito.
          Por favor, seleccione una combinación que incluya todos los productos para continuar.
        </div>
      )}
    </>
  );
};

export default ShippingSelector; 