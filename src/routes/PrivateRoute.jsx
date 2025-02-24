import { Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthenticationContext } from "../contexts/authentication.context";
import NotAuthorized from "../pages/not-authorized";
const PrivateRoute = ({ element, moduleName = "", route_permissions = [] }) => {
    const { currentUser, isAuthenticated, permissions = {}, isLoading = true } = useContext(AuthenticationContext);

    // Check if the module exists in permissions and if it has any matching permission
    const hasPermission = permissions[moduleName]?.some(permission =>
        route_permissions.includes(permission)
    );

    // Bypass permission check for SYSTEM_ADMIN
    const isSuperAdmin = currentUser === "SYSTEM_ADMIN";
    // Bypass profile page without authentication or permission check
    if (isAuthenticated && (moduleName === "profile" || moduleName === "Dashboard" || moduleName === 'change_password')) {
        return element; // Allow access to profile page regardless of authentication or permissions
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isSuperAdmin && !hasPermission && !isLoading) {
        return <NotAuthorized />;
    }


    return element;





    // if (isAuthenticated) {
    //     return element;
    // } else {
    //     return <Navigate to='/login' replace />;
    // }
};

export default PrivateRoute;