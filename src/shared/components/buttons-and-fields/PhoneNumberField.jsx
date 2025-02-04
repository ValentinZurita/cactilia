import { forwardRef } from "react";

export const PhoneNumberField = forwardRef(({ label = "Número telefónico", id = "phone", errors, ...rest }, ref) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <div className="input-group">
        <span className="input-group-text bg-white border shadow-sm">
          <i className="bi bi-telephone"></i>
        </span>
        <input
          {...rest}
          ref={ref} // ✅ React Hook Form necesita esto
          type="tel"
          className={`form-control shadow-sm ${errors ? "is-invalid" : ""}`}
          id={id}
          placeholder="(123) 456-7890"
          required
        />
        {errors && <div className="invalid-feedback">{errors.message}</div>}
      </div>
    </div>
  );
});