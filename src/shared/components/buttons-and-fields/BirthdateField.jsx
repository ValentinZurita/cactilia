export const BirthdateField = ({ label = "Fecha de nacimiento", id = "birthdate", register, errors }) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <div className="input-group">
        <input
          {...register} // Aplica register aquí ✅
          type="date"
          className={`form-control shadow-sm ${errors?.message ? 'is-invalid' : ''}`}
          id={id}
          required
        />
        <span className="input-group-text bg-white shadow-sm">
          <i className="bi bi-calendar"></i>
        </span>
        {errors?.message && <div className="invalid-feedback">{errors.message}</div>}
      </div>
    </div>
  );
};