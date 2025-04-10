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

    // Limpiar el cache para forzar la recarga de productos desde Firebase
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    
    // 📦 Cargar productos y categorías desde cache
    const cachedProducts = localStorage.getItem('products');
    const cachedCategories = localStorage.getItem('categories');

    // 🚀 Si tenemos datos en cache, los cargamos directamente
    if (cachedProducts && cachedCategories) {
      setOriginalProducts(JSON.parse(cachedProducts));
      setCategoriesMap(JSON.parse(cachedCategories));
      setLoading(false);
      return;
    }

    // 🌐 Si no hay cache, solicitamos los datos a Firebase
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

        // 🛠️ Guardar en cache local
        localStorage.setItem('products', JSON.stringify(activeProducts));
        localStorage.setItem('categories', JSON.stringify(categoryMap));

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
                console.log(`🖼️ Intentando cachear: ${product.mainImage}`);
                const response = await fetch(product.mainImage, { mode: 'cors' });
                if (response.ok) {
                  await cache.put(product.mainImage, response);
                  console.log(`✅ Imagen cacheada: ${product.mainImage}`);
                } else {
                  console.warn(`⚠️ No se pudo cachear la imagen: ${product.mainImage}`);
                }
              } catch (error) {
                console.error(`❌ Error al cachear imagen: ${product.mainImage}`, error);
              }
            }
          }
        } else {
          console.warn("⚠️ Cache Storage no disponible en este navegador.");
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProductsAndCategories();
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

    // 🔍 Filtrar por término de búsqueda (nombre)
    if (searchTerm.trim() !== "") {
      result = result.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
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