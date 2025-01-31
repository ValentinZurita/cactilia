import { Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/index.js'

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route exact path="/" element={<HomePage/>} />
    </Routes>
  );
}