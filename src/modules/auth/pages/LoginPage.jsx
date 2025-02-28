import { Logo, LoginForm, Divider, SocialButton, LoginImage } from '../components/index.js'
import { ContentWrapper, PageLayout, PageSection } from '../components/layout/index.js'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { AuthLinks } from '../../../shared/components/index.js'


export const LoginPage = () => {

    const navigate = useNavigate();
    const {status} = useSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/profile');
    }
  }, [status, navigate]);


    return (

      // Works as a container for the page
      <PageLayout>

        {/* ContentWrapper organizes the layout in a responsive row structure */}
        <ContentWrapper>

          {/* Left Section: Image (Only visible on larger screens, hidden on smaller screens) */}
          <PageSection className="d-none d-md-block p-0 m-0">
            <LoginImage />
          </PageSection>

          {/* Right Section: Login form and related elements */}
          <PageSection>
            {/* Logo */}
            <Logo styles={{ maxWidth: '150px'}} />
            {/* Form */}
            <LoginForm />

            {/* Divider */}
            <Divider text="o ingresa con" />

            {/* Social login buttons-and-fields */}
            <SocialButton type="google" />
          {/*  <SocialButton type="apple" />*/}

            {/* No tienes cuenta */}
            <AuthLinks/>

          </PageSection>

      </ContentWrapper>

    </PageLayout>

    );

};