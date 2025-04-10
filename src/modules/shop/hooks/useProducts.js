import { useState, useEffect, useMemo } from "react";
import { getProducts } from '../../admin/services/productService.js';
import { getCategories } from '../../admin/services/categoryService.js';


/**
 * Hook para manejar los datos de la página de Shop.
 * - Carga de productos
 * - Filtros
 * - Paginación
 * - Categorías
 * @returns {{
 *  loading: boolean,
 *  error: unknown,
 *  searchTerm: string,
 *  setSearchTerm: (value: string) => void,
 *  selectedCategory: string,
 *  setSelectedCategory: (value: string) => void,
 *  priceOrder: string,
 *  setPriceOrder: (value: string) => void,
 *  products: T[],
 *  totalPages: number,
 *  currentPage: number,
 *  setCurrentPage: (value: number) => void,
 *  categories: string[]
 * }}
 */


export const useProducts = () => {


  // 1️⃣ Estados para datos
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesMap, setCategoriesMap] = useState({});


  // 2️⃣ Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceOrder, setPriceOrder] = useState(""); // Ej: "Menor a Mayor", "Mayor a Menor", "Destacados", "Ninguno"


  // 3️⃣ Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;



  /*
    +-----------------------------------------------+
    |                                               |
    |   📦 Cargar productos y categorías al montar  |
    |                                               |
    +-----------------------------------------------+
  */

  useEffect(() => {
    // Configuración de caché
    const CACHE_VERSION = "1.0"; // Incrementar cuando cambie la estructura de datos
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos
    
    // Verificar caché y su validez
    const cachedData = localStorage.getItem('shop_cache');
    let isValidCache = false;
    
    if (cachedData) {
      try {
        const cache = JSON.parse(cachedData);
        const isExpired = Date.now() > cache.expiry;
        const isCorrectVersion = cache.version === CACHE_VERSION;
        
        if (!isExpired && isCorrectVersion && cache.products && cache.categories) {
          console.log("🚀 Usando datos de caché local (válido por", 
            Math.round((cache.expiry - Date.now()) / 1000 / 60), "minutos más)");
          setOriginalProducts(cache.products);
          setCategoriesMap(cache.categories);
          setLoading(false);
          isValidCache = true;
        } else {
          console.log("🔄 Caché expirado o versión incorrecta, recargando datos");
        }
      } catch (e) {
        console.warn("⚠️ Error leyendo caché:", e);
      }
    }
    
    // Si no hay caché válido, cargamos desde Firebase
    if (!isValidCache) {
      const loadProductsAndCategories = async () => {
        setLoading(true);
        try {
          // 🔍 Cargar productos
          const { ok: okProducts, data: productsData, error: productsError } = await getProducts();
          if (!okProducts) throw new Error(productsError);

          // 🏷️ Cargar categorías
          const { ok: okCategories, data: categoriesData, error: categoriesError } = await getCategories();
          if (!okCategories) throw new Error(categoriesError);

          // 🗺️ Crear un mapa de categoryId -> categoryName
          const categoryMap = categoriesData.reduce((acc, category) => {
            acc[category.id] = category.name;
            return acc;
          }, {});
          setCategoriesMap(categoryMap);

          // 🔄 Asignar el nombre de la categoría a cada producto
          const activeProducts = productsData
            .filter((prod) => prod.active)
            .map((prod) => ({
              ...prod,
              category: categoryMap[prod.categoryId] || 'Sin categoría',
            }));

          // 🛠️ Guardar en cache local con tiempo de expiración
          const cacheData = {
            version: CACHE_VERSION,
            expiry: Date.now() + CACHE_TTL,
            products: activeProducts,
            categories: categoryMap,
            timestamp: Date.now()
          };
          
          localStorage.setItem('shop_cache', JSON.stringify(cacheData));
          console.log("✅ Nuevos datos almacenados en caché");

          // ✅ Guardamos los productos activos en el estado
          setOriginalProducts(activeProducts);

          /*
            +-------------------------------------------+
            |                                           |
            |   📸 Cachear imágenes en Cache Storage    |
            |                                           |
            +-------------------------------------------+
          */
          if ('caches' in window) {
            const cache = await caches.open('cactilia-product-images');
            for (const product of activeProducts) {
              if (product.mainImage) {
                try {
                  // Verificar si la imagen ya está en caché
                  const cacheMatch = await cache.match(product.mainImage);
                  if (!cacheMatch) {
                    const response = await fetch(product.mainImage, { mode: 'cors' });
                    if (response.ok) {
                      await cache.put(product.mainImage, response);
                    }
                  }
                } catch (error) {
                  console.warn(`⚠️ Error al cachear imagen:`, error);
                }
              }
            }
          }

        } catch (err) {
          setError(err.message);
          console.error("❌ Error cargando datos:", err);
        } finally {
          setLoading(false);
        }
      };

      loadProductsAndCategories();
    }
  }, []);





  /*
    +------------------------------------------------+
    |                                                |
    |   🔍 Filtrar productos por búsqueda, categoría |
    |          y orden de precios                    |
    +------------------------------------------------+
   */

  const filteredProducts = useMemo(() => {
    // 🛑 Si hay carga o error, devolver un array vacío
    if (loading || error) return [];

    let result = [...originalProducts];

    // 🔍 Filtrar por término de búsqueda (nombre o categoría)
    if (searchTerm.trim() !== "") {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      result = result.filter((prod) => 
        // Buscar en el nombre del producto
        (prod.name && prod.name.toLowerCase().includes(normalizedSearchTerm)) || 
        // Buscar en la categoría del producto
        (prod.category && prod.category.toLowerCase().includes(normalizedSearchTerm))
      );
    }

    // 🏷️ Filtrar por categoría
    if (selectedCategory) {
      result = result.filter((prod) => prod.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 💲 Ordenar por precio
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

    // ✅ Devolver los productos filtrados
    return result;

  }, [originalProducts, loading, error, searchTerm, selectedCategory, priceOrder]);



  /*
    +----------------------------------------------+
    |                                              |
    |   🔢 Calcular el número total de páginas     |
    |                                              |
    +----------------------------------------------+
   */

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts]);



  /*
    +-------------------------------------------------+
    |                                                 |
    |   📑 Obtener los productos de la página actual  |
    |                                                 |
    +-------------------------------------------------+
   */

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  /*
    +--------------------------------------------+
    |                                            |
    |   🏷️ Obtener las categorías únicas         |
    |                                            |
    +--------------------------------------------+
   */

  const categories = useMemo(() => {
    const uniqueCategories = originalProducts
      .map((prod) => prod.category)
      .filter(Boolean); // Eliminar valores nulos o undefined
    return [...new Set(uniqueCategories)];
  }, [originalProducts]);



  /*
    +-------------------------------------------------+
    |                                                 |
    |  🛠️ Retornar el estado y las funciones del hook |
    |                                                 |
    +-------------------------------------------------+
   */

  return {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    priceOrder,
    setPriceOrder,
    products: currentProducts,
    totalPages,
    currentPage,
    setCurrentPage,
    categories,
  };
};