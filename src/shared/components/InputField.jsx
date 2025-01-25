export const InputField = ({ label, type, id, placeholder }) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <input
        type={type}
        className="form-control shadow-sm"
        id={id}
        placeholder={placeholder}
        required
      />
    </div>
  );
};