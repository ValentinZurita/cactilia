/**
 * MediaFilters - Component for filtering media items
 *
 * Provides a clean interface for applying filters to the media library
 *
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFilterChange - Handler for filter changes
 * @param {Array} props.categories - Available categories for filtering
 * @returns {JSX.Element}
 *
 * @example
 * <MediaFilters
 *   filters={filters}
 *   onFilterChange={handleFilterChange}
 *   categories={categories}
 * />
 */
export const MediaFilters = ({ filters, onFilterChange, categories = [] }) => {
  // Handler for category filter changes
  const handleCategoryChange = (e) => {
    onFilterChange({ category: e.target.value || null });
  };

  // Handler for search term changes
  const handleSearchChange = (e) => {
    onFilterChange({ searchTerm: e.target.value });
  };

  return (
    <div className="media-filters mb-4">
      <div className="row g-3 align-items-end">
        {/* Search field */}
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small">Search files</label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search by name, tag..."
              value={filters.searchTerm || ''}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="col-12 col-md-4">
          <label className="form-label text-muted small">Category</label>
          <select
            className="form-select form-select-sm"
            value={filters.category || ''}
            onChange={handleCategoryChange}
          >
            <option value="">All categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Reset filters button */}
        <div className="col-12 col-md-2">
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={() => onFilterChange({
              category: null,
              searchTerm: '',
              tags: []
            })}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};