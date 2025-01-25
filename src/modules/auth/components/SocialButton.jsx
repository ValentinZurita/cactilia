import React from 'react';

export const SocialButton = ({ type }) => {

  // Define the configuration for each social button
  const socialConfig = {
    google: {
      text: "Continua con Google",
      icon: "bi bi-google", // Bootstrap icon class for Google
      backgroundColor: "#fff",
      borderColor: "#ccc",
      textColor: "#000",
    },
    apple: {
      text: "Continua con Apple",
      icon: "bi bi-apple", // Bootstrap icon class for Apple
      backgroundColor: "#000",
      borderColor: "#000",
      textColor: "#fff",
    },
  };

  // Get the configuration for the social button type or use Google by default
  const { text, icon, backgroundColor, borderColor, textColor } =
  socialConfig[type] || socialConfig.google;

  return (

    // Social button
    <button
      className="btn d-flex justify-content-center align-items-center rounded-pill shadow-sm py-2 my-2 w-75"
      style={{
        backgroundColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontWeight: "normal",
        maxWidth: "500px",
      }}
    >

      {/* Icon */}
      <i className={`${icon} fs-4 me-3`} style={{ color: textColor }}></i>

      {/* Text */}
      {text}

    </button>
  );
};