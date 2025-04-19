// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-06.test.js

// Mock de las dependencias para pruebas controladas
const mockUseState = jest.fn();
const mockUseEffect = jest.fn();

// Crear versión aislada de la función filteredProducts para pruebas
const createFilteredProductsFunction = (params) => {
  const { loading, error, originalProducts, searchTerm, selectedCategory, priceOrder } = params;
  
  // Función que simula el comportamiento de filteredProducts
  return () => {
    // Si hay carga o error, devolver un array vacío
    if (loading || error) return [];

    let result = [...originalProducts];

    // Filtrar por término de búsqueda (nombre o categoría)
    if (searchTerm.trim() !== "") {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      result = result.filter((prod) => 
        (prod.name && prod.name.toLowerCase().includes(normalizedSearchTerm)) || 
        (prod.category && prod.category.toLowerCase().includes(normalizedSearchTerm))
      );
    }

    // Filtrar por categoría
    if (selectedCategory) {
      result = result.filter((prod) => prod.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Ordenar por precio
    switch (priceOrder) {
      case "Menor a Mayor":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Mayor a Menor":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Destacados":
        result = result.filter((prod) => prod.featured);
        break;
      default:
        break;
    }

    return result;
  };
};

describe('Filtrado de productos', () => {
  // Caso 1: Loading o error activo
  test('debería retornar array vacío cuando loading es true', () => {
    const params = {
      loading: true, 
      error: null,
      originalProducts: [
        { id: "p1", name: "Producto 1", price: 100 },
        { id: "p2", name: "Producto 2", price: 200 }
      ],
      searchTerm: "",
      selectedCategory: "",
      priceOrder: ""
    };
    
    const filteredProducts = createFilteredProductsFunction(params);
    expect(filteredProducts()).toEqual([]);
  });
  
  // Caso 2: Sin filtros ni ordenamiento
  test('debería retornar todos los productos sin filtros ni ordenamiento', () => {
    const originalProducts = [
      { id: "p1", name: "Producto 1", price: 100 },
      { id: "p2", name: "Producto 2", price: 200 }
    ];
    
    const params = {
      loading: false, 
      error: null,
      originalProducts,
      searchTerm: "",
      selectedCategory: "",
      priceOrder: ""
    };
    
    const filteredProducts = createFilteredProductsFunction(params);
    expect(filteredProducts()).toEqual(originalProducts);
  });
  
  // Caso 3: Solo filtro por término de búsqueda
  test('debería filtrar productos por término de búsqueda', () => {
    const originalProducts = [
      { id: "p1", name: "Maceta Grande", price: 150 },
      { id: "p2", name: "Maceta Pequeña", price: 80 },
      { id: "p3", name: "Cactus Espinoso", price: 120 }
    ];
    
    const params = {
      loading: false, 
      error: null,
      originalProducts,
      searchTerm: "maceta",
      selectedCategory: "",
      priceOrder: ""
    };
    
    const filteredProducts = createFilteredProductsFunction(params);
    expect(filteredProducts()).toEqual([
      { id: "p1", name: "Maceta Grande", price: 150 },
      { id: "p2", name: "Maceta Pequeña", price: 80 }
    ]);
  });
  
  // Caso 4: Solo filtro por categoría
  test('debería filtrar productos por categoría', () => {
    const originalProducts = [
      { id: "p1", name: "Cactus A", category: "cactus", price: 100 },
      { id: "p2", name: "Suculenta B", category: "suculentas", price: 200 }
    ];
    
    const params = {
      loading: false, 
      error: null,
      originalProducts,
      searchTerm: "",
      selectedCategory: "cactus",
      priceOrder: ""
    };
    
    const filteredProducts = createFilteredProductsFunction(params);
    expect(filteredProducts()).toEqual([
      { id: "p1", name: "Cactus A", category: "cactus", price: 100 }
    ]);
  });
  
  // Caso 5: Solo ordenamiento ascendente
  test('debería ordenar productos por precio ascendente', () => {
    const originalProducts = [
      { id: "p1", name: "Producto 1", price: 200 },
      { id: "p2", name: "Producto 2", price: 100 }
    ];
    
    const params = {
      loading: false, 
      error: null,
      originalProducts,
      searchTerm: "",
      selectedCategory: "",
      priceOrder: "Menor a Mayor"
    };
    
    const filteredProducts = createFilteredProductsFunction(params);
    expect(filteredProducts()).toEqual([
      { id: "p2", name: "Producto 2", price: 100 },
      { id: "p1", name: "Producto 1", price: 200 }
    ]);
  });
  
  // Caso 6: Solo ordenamiento descendente
  test('debería ordenar productos por precio descendente', () => {
    const originalProducts = [
      { id: "p1", name: "Producto 1", price: 100 },
      { id: "p2", name: "Producto 2", price: 200 }
    ];
    
    const params = {
      loading: false, 
      error: null,
      originalProducts,
      searchTerm: "",
      selectedCategory: "",
      priceOrder: "Mayor a Menor"
    };
    
    const filteredProducts = createFilteredProductsFunction(params);
    expect(filteredProducts()).toEqual([
      { id: "p2", name: "Producto 2", price: 200 },
      { id: "p1", name: "Producto 1", price: 100 }
    ]);
  });
  
  // Caso 7: Solo filtro por destacados
  test('debería filtrar productos destacados', () => {
    const originalProducts = [
      { id: "p1", name: "Producto 1", featured: true, price: 100 },
      { id: "p2", name: "Producto 2", featured: false, price: 80 }
    ];
    
    const params = {
      loading: false, 
      error: null,
      originalProducts,
      searchTerm: "",
      selectedCategory: "",
      priceOrder: "Destacados"
    };
    
    const filteredProducts = createFilteredProductsFunction(params);
    expect(filteredProducts()).toEqual([
      { id: "p1", name: "Producto 1", featured: true, price: 100 }
    ]);
  });
}); 