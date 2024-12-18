import { Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthenticationContext } from "../contexts/authentication.context";
import NotAuthorized from "../pages/not-authorized";

const PrivateRoute = ({ element, moduleName ="", route_permissions = [] }) => {
    const { isAuthenticated, permissions = {} } = useContext(AuthenticationContext);

    console.log(permissions[moduleName])

    // Check if the module exists in permissions and if it has any matching permission
    const hasPermission = permissions[moduleName]?.some(permission =>
        route_permissions.includes(permission)
    );


    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasPermission) {
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