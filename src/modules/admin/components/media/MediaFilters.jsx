/**
 * MediaFilters - Component for filtering media items by category and search term
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFilterChange - Handler for filter changes
 * @param {Array} props.categories - Available categories
 * @returns {JSX.Element}
 */
export const MediaFilters = ({ filters, onFilterChange, categories = [] }) => {
  // Handler for category change
  const handleCategoryChange = (e) => {
    onFilterChange({ category: e.target.value || null });
  };

  // Handler for search input change
  const handleSearchChange = (e) => {
    onFilterChange({ searchTerm: e.target.value });
  };

  return (
    <div className="mb-4 p-3 border-bottom">
      <div className="row g-3 align-items-end">
        {/* Search Input */}
        <div className="col-12 col-md-6">
          <label className="form-label">Search Media</label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, tag..."
              value={filters.searchTerm || ''}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="col-12 col-md-4">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={filters.category || ''}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters Button */}
        <div className="col-12 col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => onFilterChange({
              category: null,
              searchTerm: '',
              tags: []
            })}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};