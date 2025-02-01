export const PhoneNumberField = ({ label = "Número telefónico", id = "phone-number" }) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <div className="input-group">
        <span className="input-group-text bg-white border shadow-sm">
          <i className="bi bi-telephone"></i>
        </span>
        <input
          type="tel"
          className="form-control shadow-sm"
          id={id}
          placeholder="(123) 456-7890"
          required
        />
      </div>
    </div>
  );
};