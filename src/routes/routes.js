import React from "react";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import Login from "../pages/authentication/Login";
import Otp from "../pages/authentication/Otp";
import ResetPassword from "../pages/authentication/ResetPassword";
import NotFoundPage from "../pages/common/NotFoundPage";
import Dashboard from "../pages/dashboard";
import DistrictdataPage from "../pages/districtdata";
import CityMaster from "../pages/master management/cityMaster";
import ClaimSubtype from "../pages/master management/claimSubType";
import ClaimType from "../pages/master management/claimtype";
import InquirySubtype from "../pages/master management/inquirySubtype";
import InquiryType from "../pages/master management/inquiryType";
import ProvinceMaster from "../pages/master management/provinceMaster";
import TemplateMaster from "../pages/master management/TemplateMaster";
import AuditLogs from "../pages/auditLogs";
import ViewAuditTrail from "../pages/auditLogs/ViewAuditTrail";
import ChangePassword from "../pages/Profile/ChangePassword";
import RoleRightsList from "../pages/role-rights";
import StatesList from "../pages/states";
import UserList from "../pages/users";

const Settings = React.lazy(() => import("../pages/settings"));
const AccountProfile = React.lazy(() => import("../pages/Profile"));

// Saving Challenges
const AddEditState = React.lazy(() => import("../pages/states/StateForm"));
const AddStatePage = React.lazy(() => import("../pages/states/AddStatePage"));
const AddUserPage = React.lazy(() => import("../pages/users/AddUserPage"));
const AddEditRoleRights = React.lazy(() =>
  import("../pages/role-rights/RoleRightsForm")
);

const routes = [
  {
    path: "/",
    element: <Dashboard />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    isPrivate: true,
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
    element: <Dashboard />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/claim-type",
    element: <ClaimType />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/claim-subtype",
    element: <ClaimSubtype />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/inquiry-type",
    element: <InquiryType />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/inquiry-subtype",
    element: <InquirySubtype />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/province-master",
    element: <ProvinceMaster />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/city-master",
    element: <CityMaster />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/template-master",
    element: <TemplateMaster />,
    isPrivate: true,
    layoutType: "Auth",
  },
  {
    path: "/login",
    element: <Login />,
    isPrivate: false,
    layoutType: "Blank",

        // path: "/",
        // element: <Login />,
        // isPrivate: false,
        // layoutType: "Auth",
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
        path: "/profile",
        element: <AccountProfile />,
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
        path: "/users/add",
        element: <AddUserPage isEdit={false} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/users/edit/:id",
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
        path: "/settings",
        element: <Settings />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/role-rights",
        element: <RoleRightsList />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/role-rights/add",
        element: <AddEditRoleRights isEdit={false} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/role-rights/edit/:id",
        element: <AddEditRoleRights isEdit={true} />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "*",
        element: <NotFoundPage />,
        isPrivate: false,
        layoutType: "Blank",
    },
    {
        path: "/reports/audit-trail",
        element: <AuditLogs />,
        isPrivate: true,
        layoutType: "Auth",
    },
    {
        path: "/reports/audit-trail/:id",
        element: <ViewAuditTrail />,
        isPrivate: true,
        layoutType: "Auth",
    },
];

export default routes;
