export const Divider = ({ text = "o", className = "" }) => {
  return (
    <div className={`w-75 text-center position-relative my-4 ${className}`}>

      {/* Divider */}
      <hr className="border-muted" />

      {/* Text */}
      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
        {text}
      </span>

    </div>
  );
};