import { useState, useEffect, useMemo } from "react";
import { INITIAL_PRODUCTS } from "../data/mockProducts";

/**
 * Hook para manejar los datos de la página de Shop.
 * - Carga de productos
 * - Filtros
 * - Paginación
 * - Categorías
 * @returns {{loading: boolean, error: unknown, searchTerm: string, setSearchTerm: (value: (((prevState: string) => string) | string)) => void, selectedCategory: string, setSelectedCategory: (value: (((prevState: string) => string) | string)) => void, priceOrder: string, setPriceOrder: (value: (((prevState: string) => string) | string)) => void, products: T[], totalPages: number, currentPage: number, setCurrentPage: (value: (((prevState: number) => number) | number)) => void, categories: any[]}}
 */

export const useProducts = () => {
  // 1. Estados para datos
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceOrder, setPriceOrder] = useState(""); // Ej: "Menor a Mayor", "Mayor a Menor", "Destacados", "Ninguno"

  // 3. Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  // 4. Carga de datos simulada (Se implementara con Firebase)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        setOriginalProducts(INITIAL_PRODUCTS);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, []);

  // 5. Filtrado y ordenamiento
  const filteredProducts = useMemo(() => {
    if (loading || error) return [];

    let result = [...originalProducts];

    // Filtrado por búsqueda (título)
    if (searchTerm.trim() !== "") {
      result = result.filter((prod) =>
        prod.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrado por categoría
    if (selectedCategory) {
      result = result.filter((prod) => prod.category === selectedCategory);
    }

    // Ordenamiento o filtrado por "Destacados"
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
      case "Ninguno":
      default:
        // Sin cambios
        break;
    }

    return result;
  }, [originalProducts, loading, error, searchTerm, selectedCategory, priceOrder]);

  // 6. Paginación
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts]);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // 7. Extracción de categorías únicas (para el FilterBar)
  const categories = useMemo(() => {
    const allCategories = originalProducts.map((p) => p.category);
    return [...new Set(allCategories)];
  }, [originalProducts]);

  // 8. Retornamos lo necesario
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