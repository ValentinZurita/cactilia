export const ImageComponent = ({src, alt, className}) => {
  console.log("ImageComponent src:", src); // 👀 Verifica si el src es correcto
  return <img 
    src={src} 
    alt={alt} 
    className={`img-fluid ${className}`} 
    loading="lazy" 
    decoding="async" 
  />;
};