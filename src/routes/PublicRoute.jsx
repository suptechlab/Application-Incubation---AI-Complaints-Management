import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthenticationContext } from "../contexts/authentication.context";

const PublicRoute = ({ element }) => {
    const { isAuthenticated } = useContext(AuthenticationContext);
    console.log('isAuthenticated',isAuthenticated)
    console.log('element',element)
    const location = useLocation()
    console.log('location',location)
    if (isAuthenticated) {
       
        // Check if the user is trying to access the login, forgot password, or reset password page
        // const allowedPages = ["Login", "ForgotPassword", "ResetPassword" ];
        // if (element && element.type && allowedPages.includes(element.type.name)) {
        const allowedPages = ["/login", "/forgot-password", "/reset-password" ];
        if (element && element.type && allowedPages.includes(location.pathname)) {
            console.log(' true includes 19 ',element.type)
            return <Navigate to='/dashboard' replace />;
        }
        console.log(' false element.type ',element.type)
        console.log(' false element.type.name ',element.type.name)
        // else{
        //     return <Navigate to='/login' replace />;
        // }
    }
    console.log('Not Authenticated 28 ')
    return element;
};

export default PublicRoute;