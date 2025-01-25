export const SubmitButton = ({ text, color = 'primary', outlined = false }) => {

  // Colors available for the button
  const colors = {
    primary: '#2AAD46',
    green: '#34C749',
    blue: '#497595',
  };

  // Define the button style
  // You can select between an outlined or filled button
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
      className="btn w-100 fw-bold my-2 shadow-sm"
      style={buttonStyle}
    >
      {text}
    </button>
  );
};