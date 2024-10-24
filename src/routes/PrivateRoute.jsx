import { Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthenticationContext } from "../contexts/authentication.context";

const PrivateRoute = ({ element }) => {
    const { isAuthenticated } = useContext(AuthenticationContext);


    // CHANGE CONDITION HERE TO if(isAuthenticated) FOR NOW I'VE BYPASS LOGIN
    if (!isAuthenticated) {
        return element;
    } else {
        return <Navigate to='/login' replace />;
    }
};

export default PrivateRoute;