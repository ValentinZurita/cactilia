import { Logo, LoginForm, Divider, SocialButton } from '../components/index.js'


export const LoginPage = () => {
    return (

      <div className="container d-flex flex-column align-items-center justify-content-center vh-100 text-center" style={{ maxWidth: '600px' }}>

          {/* Logo */}
          <Logo styles={{ maxWidth: '150px' }} />

          {/* Form */}
          <LoginForm />

          {/* Divider */}
          <Divider text="o ingresa con" />

          {/* Google Sing In*/}
          <SocialButton type="google" />

          {/* Apple Sing In*/}
          <SocialButton type="apple" />

      </div>

    );
};