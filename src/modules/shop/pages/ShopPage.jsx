import { useState, useEffect } from 'react';
import { SearchBar } from '../components/shop-page/SearchBar.jsx';
import { FilterBar } from '../components/shop-page/FilterBar.jsx';
import { ProductList } from '../components/shop-page/ProductList.jsx';
import { Pagination } from '../components/shop-page/Pagination.jsx';
import { HeroSection } from '../../public/components/home-page/index.js'
import { heroImages } from '../../../shared/constants/index.js'


// 🔥 Datos iniciales
const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: "Producto 1",
    image: "/public/images/placeholder.jpg",
    price: 10.99,
    category: "Categoría 1",
    featured: false,
  },
  {
    id: 2,
    title: "Producto 2",
    image: "/public/images/placeholder.jpg",
    price: 14.99,
    category: "Categoría 1",
    featured: false,
  },
  {
    id: 3,
    title: "Producto 3",
    image: "/public/images/placeholder.jpg",
    price: 19.99,
    category: "Categoría 2",
    featured: true,
  },
  {
    id: 4,
    title: "Producto 4",
    image: "/public/images/placeholder.jpg",
    price: 5.49,
    category: "Categoría 2",
    featured: false,
  },
  {
    id: 5,
    title: "Producto 5",
    image: "/public/images/placeholder.jpg",
    price: 7.99,
    category: "Categoría 3",
    featured: false,
  },
  {
    id: 6,
    title: "Producto 6",
    image: "/public/images/placeholder.jpg",
    price: 20.99,
    category: "Categoría 3",
    featured: true,
  },
  {
    id: 7,
    title: "Producto 7",
    image: "/public/images/placeholder.jpg",
    price: 50.0,
    category: "Categoría 4",
    featured: false,
  },
  {
    id: 8,
    title: "Producto 8",
    image: "/public/images/placeholder.jpg",
    price: 12.0,
    category: "Categoría 4",
    featured: false,
  },
  {
    id: 9,
    title: "Producto 9",
    image: "/public/images/placeholder.jpg",
    price: 9.5,
    category: "Categoría 1",
    featured: true,
  },
  {
    id: 10,
    title: "Producto 10",
    image: "/public/images/placeholder.jpg",
    price: 13.25,
    category: "Categoría 1",
    featured: false,
  },
  {
    id: 11,
    title: "Producto 11",
    image: "/public/images/placeholder.jpg",
    price: 49.99,
    category: "Categoría 2",
    featured: false,
  },
  {
    id: 12,
    title: "Producto 12",
    image: "/public/images/placeholder.jpg",
    price: 2.5,
    category: "Categoría 2",
    featured: true,
  },
  {
    id: 13,
    title: "Producto 13",
    image: "/public/images/placeholder.jpg",
    price: 6.89,
    category: "Categoría 3",
    featured: false,
  },
  {
    id: 14,
    title: "Producto 14",
    image: "/public/images/placeholder.jpg",
    price: 7.99,
    category: "Categoría 3",
    featured: false,
  },
  {
    id: 15,
    title: "Producto 15",
    image: "/public/images/placeholder.jpg",
    price: 15.0,
    category: "Categoría 4",
    featured: true,
  },
  {
    id: 16,
    title: "Producto 16",
    image: "/public/images/placeholder.jpg",
    price: 25.0,
    category: "Categoría 4",
    featured: false,
  },
  {
    id: 17,
    title: "Producto 17",
    image: "/public/images/placeholder.jpg",
    price: 95.0,
    category: "Categoría 1",
    featured: false,
  },
  {
    id: 18,
    title: "Producto 18",
    image: "/public/images/placeholder.jpg",
    price: 1.99,
    category: "Categoría 2",
    featured: true,
  },
  {
    id: 19,
    title: "Producto 19",
    image: "/public/images/placeholder.jpg",
    price: 22.55,
    category: "Categoría 3",
    featured: false,
  },
  {
    id: 20,
    title: "Producto 20",
    image: "/public/images/placeholder.jpg",
    price: 33.33,
    category: "Categoría 4",
    featured: false,
  },
];

export const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);  // 🔥 Guardamos los productos originales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  useEffect(() => {
    // 🔥 Simulamos la carga de datos desde Firebase
    setTimeout(() => {
      setProducts(INITIAL_PRODUCTS);
      setOriginalProducts(INITIAL_PRODUCTS);  // 🔥 Guardamos la lista original
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <HeroSection
        images={heroImages}
        title="Tienda de Cactilia"
        subtitle="Encuentra productos frescos y naturales"
        showButton={false}
        height="50vh"
        autoRotate={false}
      />

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <FilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        categories={[...new Set(INITIAL_PRODUCTS.map(p => p.category))]}
        setProducts={setProducts}
        products={products}
        originalProducts={originalProducts} // 🔥 Pasamos los productos originales a FilterBar
      />

      {loading ? (
        <div className="text-center my-4">
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="text-center my-4 text-danger">
          <p>Error al cargar productos</p>
        </div>
      ) : (
        <>
          <ProductList products={products.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)} />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(products.length / PRODUCTS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
};