export const ImageComponent = ({src, alt, className}) => {
  return <img 
    src={src} 
    alt={alt} 
    className={`img-fluid ${className}`} 
    loading="lazy" 
    decoding="async" 
  />;
};