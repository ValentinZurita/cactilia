
export const SubjectSelector = ({ register, errors }) => {
  const subjects = [
    { id: 'general', label: 'General Inquiry' },
    { id: 'support', label: 'Soporte Técnico' },
    { id: 'sales', label: 'Ventas' },
    { id: 'other', label: 'Otro' }
  ];

  return (
    <div className="mb-3">
      <label className="form-label text-muted">Asunto</label>
      <div className="subject-options">
        {subjects.map((subject) => (
          <div key={subject.id} className="subject-option form-check">
            <input
              className="form-check-input"
              type="radio"
              id={subject.id}
              value={subject.id}
              {...register("asunto", { required: "Por favor selecciona un asunto" })}
            />
            <label className="form-check-label" htmlFor={subject.id}>
              {subject.label}
            </label>
          </div>
        ))}
      </div>
      {errors && <div className="invalid-feedback d-block">{errors.message}</div>}
    </div>
  );
};