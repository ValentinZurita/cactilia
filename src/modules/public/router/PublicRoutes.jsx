import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/index.js'

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route index element={<HomePage/>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}