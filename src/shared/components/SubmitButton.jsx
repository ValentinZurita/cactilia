export const SubmitButton = ({ text, color = 'primary', outlined = false }) => {

  // Available colors for the button
  const colors = {
    primary: '#2AAD46',
    green: '#34C749',
    blue: '#497595',
  };

  // Styles and classes for the button element based on the props received
  const buttonStyle = outlined
    ? {
      backgroundColor: 'transparent',
      border: `2px solid ${colors[color] || colors.primary}`,
      color: colors[color] || colors.primary,
    }
    : {
      backgroundColor: colors[color] || colors.primary,
      border: `2px solid ${colors[color] || colors.primary}`,
      color: '#fff',
    };

  return (
    <button
      type="submit"
      className="btn w-100 fw-bold my-2 shadow-sm submit-btn"
      style={buttonStyle}
    >
      {text}
    </button>
  );
};