import { Navigate, Outlet } from 'react-router-dom';
import { authApi } from '../../services/api';

/**
 * Protected route for admin pages
 * Checks authentication and admin role
 */
const AdminRoute = () => {
    const user = authApi.getCurrentUser();
    const isAuthenticated = authApi.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
