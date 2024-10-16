import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import LayoutComponent from "./LayoutComponent";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import routes from "./routes";

const Routers = () => {
    return (
<Suspense fallback={<>Loading....</>}>
<Routes>
            {routes.map((route, index) => (
                <Route
                    key={index}
                    path={route.path}
                    element={
                        <LayoutComponent layoutType={route.layoutType}>
                            {route.isPrivate ? (
                                <PrivateRoute path={route.path} element={route.element} />
                            ) : (
                                <PublicRoute path={route.path} element={route.element} />
                            )}
                        </LayoutComponent>
                    }
                />
            ))}
        </Routes>
</Suspense>
    


    );
};

export default Routers;