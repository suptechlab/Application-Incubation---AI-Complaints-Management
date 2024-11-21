import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthenticationContext } from "../contexts/authentication.context";

const PublicRoute = ({ element }) => {
    const { isAuthenticated } = useContext(AuthenticationContext);
    console.log('isAuthenticated',isAuthenticated)
    console.log('isAuthenticated',element)
    if (isAuthenticated) {
       
        // Check if the user is trying to access the login, forgot password, or reset password page
        const allowedPages = ["Login", "ForgotPassword", "ResetPassword" ];

        if (element && element.type && allowedPages.includes(element.type.name)) {
            console.log(' true includes 16 ',element.type)
            return <Navigate to='/dashboard' replace />;
        }
        console.log(' false 19 ')
        // else{
        //     return <Navigate to='/login' replace />;
        // }
    }
    console.log('Not Authenticated 24 ',element)
    return element;
};

export default PublicRoute;