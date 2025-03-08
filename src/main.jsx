import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store, persistor } from './store/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import './modules/admin/index.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store} >
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
