import '../src/styles/global.css'
import { AppRouter } from './routes/AppRouter'
import { useCheckAuth } from './shared/hooks/useCheckAuth.js'
import { Spinner } from './shared/components/spinner/Spinner.jsx'

export const App = () => {

  const status = useCheckAuth()
  if (status === 'checking') {
    return <Spinner />;
  }

  return (
    <>
      <AppRouter />
    </>
  )
}
