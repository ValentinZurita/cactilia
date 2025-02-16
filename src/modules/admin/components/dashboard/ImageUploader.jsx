import { useFormContext } from 'react-hook-form';


/**
 * Component for uploading images to a specified folder.
 *
 * @param {function} onUpload - Callback function to handle the uploaded files.
 * @param {string} folderName - The name of the folder where images should be uploaded.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <ImageUploader onUpload={handleUpload} folderName="product-images" />
 */


export const ImageUploader = ({ onUpload }) => {


  // Get form values
  const { getValues } = useFormContext();


  // Handle file change
  const handleFileChange = (e) => {
    const files = e.target.files;
    onUpload(files);
  };


  return (

    <div className="mb-3">

      {/* File input */}
      <label className="form-label">Subir Imágenes (Máx. 5)</label>

      {/* Multiple file input */}
      <input
        type="file"
        multiple
        className="form-control"
        accept="image/*"
        onChange={handleFileChange}
      />

    </div>
  );
};