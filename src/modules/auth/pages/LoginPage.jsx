import { Logo, LoginForm, Divider, SocialButton, LoginImage } from '../components/index.js'
import { ContentWrapper, PageLayout, PageSection } from '../components/layout/index.js'


export const LoginPage = () => {
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
            <Logo styles={{ maxWidth: '150px' }} />
            {/* Form */}
            <LoginForm />

            {/* Divider */}
            <Divider text="o ingresa con" />

            {/* Social login buttons */}
            <SocialButton type="google" />
            <SocialButton type="apple" />
          </PageSection>

      </ContentWrapper>

    </PageLayout>

    );

};