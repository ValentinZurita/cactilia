import '../src/styles/global.css'
import { AppRouter } from './routes/AppRouter'
import { useCheckAuth } from './shared/hooks/useCheckAuth.js'
import { Spinner } from './shared/components/spinner/Spinner.jsx'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadCartFromFirestore, mergeCartsOnLogin } from './store/cart/cartThunk.js'


export const App = () => {

  // Check if user is authenticated
  const status = useCheckAuth()

  // Get dispatch function from Redux
  const dispatch = useDispatch()

  // Get user authentication status
  const auth = useSelector(state => state.auth)


  // Effect to load cart when user logs in
  useEffect(() => {
    // If user is authenticated, load their cart from Firestore and merge with guest cart
    if (status === 'authenticated' && auth.uid) {
      // First merge any existing guest cart items with the user's cart
      dispatch(mergeCartsOnLogin())
      // Then load the user's cart from Firestore
      dispatch(loadCartFromFirestore())
    }
  }, [status, auth.uid, dispatch])


  // Show spinner while checking authentication status
  if (status === 'checking') {
    // Show spinner
    return <Spinner />;
  }


  return (
    <>
      <AppRouter />
    </>
  )

}