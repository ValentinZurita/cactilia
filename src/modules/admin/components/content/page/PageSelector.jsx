export const PageSelector = ({ selectedPage, onPageChange, availablePages }) => {
  return (
    <div className="mb-4">
      <select
        className="form-select"
        value={selectedPage}
        onChange={(e) => onPageChange(e.target.value)}
      >
        {availablePages.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};