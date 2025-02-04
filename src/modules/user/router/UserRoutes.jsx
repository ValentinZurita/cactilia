import { Route, Routes } from 'react-router-dom'

export const UserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<UserProfilePage />} />
        </Routes>
    );
};