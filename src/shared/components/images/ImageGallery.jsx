import { ImageComponent } from './ImageComponent.jsx'

export const ImageGallery = ({ images, className = "" }) => {
    return (
      <div
        className={`position-absolute top-0 start-0 w-100 h-100 ${className}`}
        style={{
            backgroundImage: `url(${images[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
      />
    );
};