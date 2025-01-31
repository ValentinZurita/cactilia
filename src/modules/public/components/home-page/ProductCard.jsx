/**
 * ProductCard Component
 *
 * A reusable component that displays a product image and its name.
 * It maintains a consistent square aspect ratio and responsive design.
 *
 * Features:
 * - Displays a product image with a fixed square aspect ratio.
 * - Uses Bootstrap utilities for spacing, alignment, and responsiveness.
 * - Ensures the image fills its container with `object-fit: cover`.
 * - Displays the product name with styled text.
 *
 * Props:
 * @param {string} name - The name of the product.
 * @param {string} image - The URL of the product image.
 */
export const ProductCard = ({ name, image }) => {
  return (
    <div className="border-0 text-center p-2 mx-2 bg-transparent">

      {/* Product Image Container - Ensures square shape and responsiveness */}
      <div className="rounded overflow-hidden mx-auto d-flex justify-content-center align-items-center"
           style={{ width: '100%', maxWidth: '220px', aspectRatio: '1 / 1' }}>
        <img src={image} className="img-fluid object-fit-cover w-100 h-100 rounded-3" alt={name} />
      </div>

      {/* Product Name */}
      <div className="mt-2">
        <p className="text-muted text-green my-2">{name}</p>
      </div>

    </div>
  );
};