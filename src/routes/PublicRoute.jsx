import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthenticationContext } from "../contexts/authentication.context";

const PublicRoute = ({ element }) => {
    const { isAuthenticated } = useContext(AuthenticationContext);

    const location = useLocation()
    if (isAuthenticated) {
        const allowedPages = ["/login", "/forgot-password", "/reset-password" ];
        if (element && element.type && allowedPages.includes(location.pathname)) {
            return <Navigate to='/dashboard' replace />;
        }
    }
    return element;
};

export default PublicRoute;