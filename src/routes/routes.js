import React from "react";
import Dashboard from "../pages/dashboard";
import DistrictdataPage from "../pages/districtdata";
import DashboardPage from "../pages/dashboard";
import NotFoundPage from "../pages/common/NotFoundPage";
import Login from "../pages/authentication/Login";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import ResetPassword from "../pages/authentication/ResetPassword";
import ChangePassword from "../pages/Profile/ChangePassword";
import UserList from "../pages/users";
import StatesList from "../pages/states";
import Otp from "../pages/authentication/Otp";
import RoleRightsList from "../pages/role-rights";

const UserForm = React.lazy(() => import("../pages/users/Edit"));

const Settings = React.lazy(() => import("../pages/settings"));
const UserTransactions = React.lazy(() => import("../pages/users/transactions"));


// Saving Challenges
const AddEditState = React.lazy(() => import("../pages/states/StateForm"))
const AddStatePage = React.lazy(() => import("../pages/states/AddStatePage"))
const AddUserPage = React.lazy(() => import("../pages/users/AddUserPage"))
const AddEditRoleRights = React.lazy(() => import("../pages/role-rights/RoleRightsForm"))


const routes = [

    {
        path: "/",
        element: <Dashboard />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/",
        element: <Login />,
        isPrivate: false,
        layoutType: "Auth",
    },
    
    {
        path: "/districtdata",
        element: <DistrictdataPage />,
        isPrivate: false,
        layoutType: "Auth",
    },
    {
        path: "/dashboard",
        element: <DashboardPage />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/login",
        element: <Login />,
        isPrivate: false,
        layoutType: "Blank",
    },
    {
        path: "/otp",
        element: <Otp />,
        isPrivate: false,
        layoutType: "Blank",
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
        isPrivate: false,
        layoutType: "Blank",
    },
    {
        path: "/reset-password",
        element: <ResetPassword />,
        isPrivate: false,
        layoutType: "Blank",
    },
    {
        path: "/change-password",
        element: <ChangePassword />,
        isPrivate: true,
        layoutType: "Auth",
    },
    
    
    {
        path: "/users",
        element: <UserList />,
        isPrivate: true,
        layoutType: "Auth",
    },
   
    {
        path: "/states",
        element: <StatesList />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/states/add",
        element: <AddStatePage isEdit={false} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path:"/users/add",
        element: <AddUserPage isEdit={false} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path:"/users/edit/:id",
        element: <AddUserPage isEdit={false} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/states/edit/:id",
        element: <AddEditState isEdit={true} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    
    {
        path: "/users/:id",
        element: <UserForm isEdit={true} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/users/:id/transactions",
        element: <UserTransactions />,
        isPrivate: true,
        layoutType: "Auth",
    },

    {
        path: "/settings",
        element: <Settings />,
        isPrivate: true,
        layoutType: "Auth",
    },

    
    {
        path: "/role-rights",
        element: <RoleRightsList/>,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/role-rights/add",
        element: <AddEditRoleRights isEdit={false}/>,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/role-rights/edit/:id",
        element: <AddEditRoleRights isEdit={true}/>,
        isPrivate: true,
        layoutType: "Auth",
    },

    {
        path: "*",
        element: <NotFoundPage />,
        isPrivate: false,
        layoutType: "Blank",
    },
    
];

export default routes;