import logo from '../../assets/images/logo.png';
import '../../../styles/global.css';

export const Logo = ({
                       styles = {},
                       shadow = true,
                       caption = "",
                       captionSize = "1rem",
                       captionColor = "text-white" // Opción por defecto
                     }) => {
  return (
    <div className="text-center ">
      <img
        src={logo}
        alt="Logo"
        className={`img-fluid rounded-circle ${shadow ? 'shadow-lg' : ''}`}
        style={{ maxWidth: '150px', ...styles }}
      />
      {caption && (
        <p className={`mt-2 ${captionColor}`} style={{ fontSize: captionSize, fontFamily: 'Nohemi, sans-serif' }}>
          {caption}
        </p>
      )}
    </div>
  );
};