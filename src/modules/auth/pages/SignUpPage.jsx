import { Logo, Divider, SocialButton, LoginImage } from '../components/index.js';
import { ContentWrapper, PageLayout, PageSection } from '../components/layout/index.js';
import { RegisterForm } from '../components/signup-page/RegisterForm.jsx'

export const SignUpPage = () => {
  return (
    <PageLayout>
      <ContentWrapper>

        {/* Left Section: Image (Hidden on mobile, shown on larger screens) */}
        <PageSection className="d-none d-md-block p-0 m-0">
          <LoginImage />
        </PageSection>

        {/* Right Section: Sign Up Form */}
        <PageSection>
          {/* Logo */}
          <Logo styles={{ maxWidth: '150px' }} />

          {/* SignUp Form */}
          <RegisterForm />

        </PageSection>
      </ContentWrapper>
    </PageLayout>
  );
};