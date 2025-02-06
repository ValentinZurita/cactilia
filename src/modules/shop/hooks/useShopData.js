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

export const useShopData = () => {

  // Estados
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceOrder, setPriceOrder] = useState(""); // "Ninguno", "Destacados", "Menor a Mayor", "Mayor a Menor"

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  /**
   * 1) Mock data:
   *    En un futuro, este setTimeout se reemplaza por una llamada real a Firebase.
   */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOriginalProducts(INITIAL_PRODUCTS);
      setLoading(false);
    }, 1000);
  }, []);


  /**
   * 2) Lista de productos filtrada.
   *    - Búsqueda (title)
   *    - Categoría
   *    - Orden (price asc/desc) o Destacados
   */
  const filteredProducts = useMemo(() => {
    if (loading || error) return [];

    let result = [...originalProducts];

    // Filtro por búsqueda
    if (searchTerm.trim() !== "") {
      result = result.filter((prod) =>
        prod.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory) {
      result = result.filter((prod) => prod.category === selectedCategory);
    }

    // Ordenamiento
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
        // No hacemos nada
        break;
    }

    return result;
  }, [originalProducts, loading, error, searchTerm, selectedCategory, priceOrder]);

  /**
   * 3) Paginación
   */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts]);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  /**
   * 4) Lista de categorías únicas (para el FilterBar)
   */
  const categories = useMemo(() => {
    const uniqueCats = originalProducts.map((p) => p.category);
    return [...new Set(uniqueCats)];
  }, [originalProducts]);

  /**
   * 5) Retornamos los valores necesarios para la página.
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
    categories
  };
};