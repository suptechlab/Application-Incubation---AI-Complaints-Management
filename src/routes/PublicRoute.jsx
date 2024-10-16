import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthenticationContext } from "../contexts/authentication.context";

const PublicRoute = ({ element }) => {
    const { isAuthenticated } = useContext(AuthenticationContext);

    if (isAuthenticated) {
        // Check if the user is trying to access the login, forgot password, or reset password page
        const allowedPages = ["Login", "ForgotPassword", "ResetPassword", ];

        if (element && element.type && allowedPages.includes(element.type.name)) {
            return <Navigate to='/' replace />;
        }
    }

    return element;
};

export default PublicRoute;