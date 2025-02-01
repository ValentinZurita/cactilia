export const BirthdateField = ({ label = "Fecha de nacimiento", id = "birthdate" }) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <div className="input-group">
        <input type="date" className="form-control shadow-sm" id={id} required />
        <span className="input-group-text bg-white shadow-sm">
          <i className="bi bi-calendar"></i>
        </span>
      </div>
    </div>
  );
};