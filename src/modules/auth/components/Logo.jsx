import logo from '../../../../src/assets/images/logo.png';

export const Logo = ({ styles = {} } ) => {
    return (
      <div className="text-center">
        <img
          src={logo}
          alt="Logo"
          className="img-fluid rounded-circle shadow-lg"
          style={{ maxWidth: '150px', ...styles }}
        />
      </div>
    );
};