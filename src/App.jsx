import '../src/styles/global.css'
import { AppRouter } from './routes/AppRouter'
import { Navbar } from './shared/components/index.js'

export const App = () => {
  return (
    <div>
      <Navbar />
      <AppRouter />
    </div>
  )
}
