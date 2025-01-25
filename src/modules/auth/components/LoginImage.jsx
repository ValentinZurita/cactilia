import loginImage from '../../../../src/modules/auth/assets/images/login.jpg';

export const LoginImage = () => {
  return (
    <div className="w-100 h-100 d-flex align-items-center justify-content-center position-relative">
      <img
        src={loginImage}
        alt="Calaverita de Cactilia"
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ objectFit: 'cover'}}
      />
    </div>
  );
};