import { useCallback } from 'react';

/**
 * SearchBar component
 * @param {string} searchTerm - Current search term
 * @param {Function} setSearchTerm - Function to update the search term
 * @returns {JSX.Element}
 * @constructor
 * @example
 * <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
 */

export const SearchBar = ({ searchTerm, setSearchTerm }) => {
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