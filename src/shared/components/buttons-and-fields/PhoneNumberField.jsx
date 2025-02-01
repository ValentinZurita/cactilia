export const PhoneNumberField = ({ label = "Número telefónico", id = "phone-number", register, errors }) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <div className="input-group">
        <span className="input-group-text bg-white border shadow-sm">
          <i className="bi bi-telephone"></i>
        </span>
        <input
          {...register} // Aplica register aquí ✅
          type="tel"
          className={`form-control shadow-sm ${errors?.message ? 'is-invalid' : ''}`}
          id={id}
          placeholder="(123) 456-7890"
          required
        />
        {errors?.message && <div className="invalid-feedback">{errors.message}</div>}
      </div>
    </div>
  );
};