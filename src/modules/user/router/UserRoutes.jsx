import { Route, Routes } from 'react-router-dom'
import { UserProfilePage } from '../pages/UserProfilePage.jsx'

export const UserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<UserProfilePage />} />
        </Routes>
    );
};