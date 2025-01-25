import '../src/styles/global.css'
import { AppRouter } from './routes/AppRouter'
import { Navbar } from './shared/components/index.js'
import { Footer } from './shared/components/footer/index.js'

export const App = () => {
  return (
    <div>
      <Navbar />
      <AppRouter />
      <Footer />
    </div>
  )
}
