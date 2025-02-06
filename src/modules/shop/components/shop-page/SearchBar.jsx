import '../../../../styles/pages/shop.css';
import { useCallback } from 'react'

export const SearchBar = ({ searchTerm, setSearchTerm, filters }) => {

  // Memoiza la función para evitar renderizados innecesarios
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  return (
    <div className="search-bar-bg py-3 w-100 d-flex justify-content-center">
      <div className="input-group" style={{ maxWidth: "800px", width: "90%" }}>
        <input
          type="text"
          className="form-control border-0"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="btn btn-green">Buscar</button>
      </div>
    </div>
  );
};