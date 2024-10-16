import React from "react";
import AuthLayout from "../layouts/Auth/AuthLayout";
import BlankLayout from "../layouts/blank/BlankLayout";


const LayoutType = {
    Auth: "Auth",
    Blank: "Blank"
};


const LayoutComponent = ({ layoutType, children }) => {
    const getLayoutComponent = () => {
        switch (layoutType) {
            case LayoutType.Auth:
                return AuthLayout;
            case LayoutType.Blank:
                return BlankLayout;
            default:
                return BlankLayout;
        }
    };

    const Layout = getLayoutComponent();

    return <Layout>{children}</Layout>;
};

export default LayoutComponent;

