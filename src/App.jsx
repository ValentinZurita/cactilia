import '../src/styles/global.css'
import { AppRouter } from './routes/AppRouter'
import { Footer } from './shared/components/footer/index.js'
import { useCheckAuth } from './shared/hooks/useCheckAuth.js'
import { Navbar } from './shared/components/Navbar.jsx'
import { Spinner } from './shared/components/spinner/Spinner.jsx'

export const App = () => {

  const status = useCheckAuth()
  if (status === 'checking') {
    return <Spinner />;
  }

  return (
    <>
      <Navbar />
      <AppRouter />
      <Footer />
    </>
  )
}
