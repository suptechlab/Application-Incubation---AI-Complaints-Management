import React from "react";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import Login from "../pages/authentication/Login";
import Otp from "../pages/authentication/Otp";
import ResetPassword from "../pages/authentication/ResetPassword";
import NotFoundPage from "../pages/common/NotFoundPage";
import Dashboard from "../pages/dashboard";
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
import UserList from "../pages/users";
import SLAComplianceReport from "../pages/sla-reports";
import ClaimOverviewReport from "../pages/clamOverviewReport";
import CreateClaim from "../pages/tickets/create-claim";
import TeamManagementAddEdit from "../pages/team-management/addedit";
import TicketWorkFlowAddEdit from "../pages/tickets-workflow/addedit";
import AddTemplate from "../pages/master management/TemplateMaster/Add/index";
import EditTemplate from "../pages/master management/TemplateMaster/Edit/index";
import ImportSEPSUser from "../pages/users/importData";
import PowerBiDashboard from "../pages/powerBiDashboard";


const AccountProfile = React.lazy(() => import("../pages/Profile"));

// Saving Challenges
const AddUserPage = React.lazy(() => import("../pages/users/AddUserPage"));
const FIUserList = React.lazy(() => import("../pages/fi-users"));
const FIUserAddEdit = React.lazy(() => import("../pages/fi-users/AddEdit"));
const ImportFIUser = React.lazy(() => import("../pages/fi-users/importData"));
const AddEditRoleRights = React.lazy(() =>
  import("../pages/role-rights/RoleRightsForm")
);
const TicketsList = React.lazy(() => import("../pages/tickets/list"));
const TicketsView = React.lazy(() => import("../pages/tickets/view"));
const TeamManagementList = React.lazy(() => import("../pages/team-management/list"));
const TicketWorkFlowList = React.lazy(() => import("../pages/tickets-workflow/list"));

const routes = [
  // {
  //   path: "/",
  //   element: <Dashboard />,
  //   isPrivate: true,
  //   layoutType: "Auth",
  // },
  {
    path: "/",
    element: <Login />,
    isPrivate: false,
    // layoutType: "Auth",
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Dashboard",
    permissions: ["DASHBOARD_VIEW_FI", "DASHBOARD_VIEW_SEPS"]
  },

  {
    path: "/dashboard/power-bi",
    element: <PowerBiDashboard />,
    isPrivate: true,
    layoutType: "Auth",
    module: "power-bi-dashboard",
  },
  {
    path: "/claim-type",
    element: <ClaimType />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Claim Type Master",
    permissions: ["CLAIM_TYPE_CREATE",
      "CLAIM_TYPE_UPDATE",
      "CLAIM_TYPE_STATUS_CHANGE",
      "CLAIM_TYPE_CREATE_FI",
      "CLAIM_TYPE_UPDATE_FI",
      "CLAIM_TYPE_STATUS_CHANGE_FI"],
  },
  {
    path: "/claim-subtype",
    element: <ClaimSubtype />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Claim Sub Type Master",
    permissions: ["CLAIM_SUB_TYPE_CREATE",
      "CLAIM_SUB_TYPE_UPDATE",
      "CLAIM_SUB_TYPE_STATUS_CHANGE",
      "CLAIM_SUB_TYPE_CREATE_FI",
      "CLAIM_SUB_TYPE_UPDATE_FI",
      "CLAIM_SUB_TYPE_STATUS_CHANGE_FI"
    ],
  },
  // {
  //   path: "/inquiry-type",
  //   element: <InquiryType />,
  //   isPrivate: true,
  //   layoutType: "Auth",
  //   module: "Inquiry Type Master",
  //   permissions: ["INQUIRY_TYPE_CREATE", "INQUIRY_TYPE_UPDATE", "INQUIRY_TYPE_STATUS_CHANGE"],
  // },
  // {
  //   path: "/inquiry-subtype",
  //   element: <InquirySubtype />,
  //   isPrivate: true,
  //   layoutType: "Auth",
  //   module: "Inquiry Sub Type Master",
  //   permissions: ["INQUIRY_SUB_TYPE_CREATE", "INQUIRY_SUB_TYPE_UPDATE", "INQUIRY_SUB_TYPE_STATUS_CHANGE"],
  // },
  {
    path: "/province-master",
    element: <ProvinceMaster />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Province Master",
    permissions: ["PROVINCE_CREATE", "PROVINCE_UPDATE", "PROVINCE_STATUS_CHANGE"],
  },
  {
    path: "/city-master",
    element: <CityMaster />,
    isPrivate: true,
    layoutType: "Auth",
    module: "City Master",
    permissions: ["CITY_CREATE", "CITY_UPDATE", "CITY_STATUS_CHANGE"],
  },
  {
    path: "/template-master",
    element: <TemplateMaster />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Template Master",
    permissions: ["TEMPLATE_CREATE",
      "TEMPLATE_UPDATE",
      "TEMPLATE_STATUS_CHANGE",
      "TEMPLATE_CREATE_FI",
      "TEMPLATE_UPDATE_FI",
      "TEMPLATE_STATUS_CHANGE_FI"],
  },
  {
    path: "/template-master/add",
    element: <AddTemplate />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Template Master",
    permissions: ["TEMPLATE_CREATE", "TEMPLATE_CREATE_FI"]
  },
  {
    path: "/template-master/edit/:id",
    element: <EditTemplate />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Template Master",
    permissions: ["TEMPLATE_UPDATE", "TEMPLATE_UPDATE_FI"]
  },
  {
    path: "/login",
    element: <Login />,
    isPrivate: false,
    // layoutType: "Blank",

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
    module: 'change_password'
  },
  {
    path: "/profile",
    element: <AccountProfile />,
    isPrivate: true,
    module: 'profile',
    layoutType: "Auth",
  },
  {
    path: "/users",
    element: <UserList />,
    isPrivate: true,
    layoutType: "Auth",
    module: "SEPS User",
    permissions: ["SEPS_USER_CREATE_BY_SEPS", "SEPS_USER_UPDATE_BY_SEPS", "SEPS_USER_STATUS_CHANGE_BY_SEPS", "SEPS_USER_IMPORT_BY_SEPS"]
  },

  {
    path: "/users/add",
    element: <AddUserPage isEdit={false} />,
    isPrivate: true,
    layoutType: "Auth",
    module: "SEPS User",
    permissions: ["SEPS_USER_CREATE_BY_SEPS"]
  },
  {
    path: "/users/edit/:id",
    element: <AddUserPage isEdit={false} />,
    isPrivate: true,
    layoutType: "Auth",
    module: "SEPS User",
    permissions: ["SEPS_USER_UPDATE_BY_SEPS"]
  },
  {
    path: "/users/import",
    element: <ImportSEPSUser isEdit={false} />,
    isPrivate: true,
    module: "SEPS User",
    layoutType: "Auth",
    permissions: ["SEPS_USER_IMPORT_BY_SEPS"]
  },

  // {
  //   path: "/users/import",
  //   element: <ImportSEPSUser isEdit={false} />,
  //   isPrivate: true,
  //   module: "SEPS User",
  //   layoutType: "Auth",
  //   permissions: ["SEPS_USER_CREATE_BY_SEPS"]
  // },

  {
    path: "/role-rights",
    element: <RoleRightsList />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Role & Rights",
    permissions: ["ROLE_AND_RIGHT_CREATE_BY_SEPS", "ROLE_AND_RIGHT_UPDATE_BY_SEPS", "ROLE_AND_RIGHT_STATUS_CHANGE_BY_SEPS"]
  },
  {
    path: "/role-rights/add",
    element: <AddEditRoleRights isEdit={false} />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Role & Rights",
    permissions: ["ROLE_AND_RIGHT_CREATE_BY_SEPS"]
  },
  {
    path: "/role-rights/edit/:id",
    element: <AddEditRoleRights isEdit={true} />,
    isPrivate: true,
    module: "Role & Rights",
    layoutType: "Auth",
    permissions: ["ROLE_AND_RIGHT_UPDATE_BY_SEPS"]
  },
  {
    path: "/fi-users",
    element: <FIUserList />,
    isPrivate: true,
    module: "FI User",
    layoutType: "Auth",
    permissions: ["FI_USER_CREATE_BY_SEPS",
      "FI_UPDATE_CREATE_BY_SEPS",
      "FI_STATUS_CHANGE_CREATE_BY_SEPS",
      "FI_USER_CREATE_BY_FI",
      "FI_UPDATE_CREATE_BY_FI",
      "FI_STATUS_CHANGE_CREATE_BY_FI"
    ]
  },
  {
    path: "/fi-users/add",
    element: <FIUserAddEdit isEdit={false} />,
    isPrivate: true,
    layoutType: "Auth",
    module: "FI User",
    permissions: ["FI_USER_CREATE_BY_SEPS", "FI_USER_CREATE_BY_FI", "FI_USER_IMPORT_BY_SEPS", "FI_USER_IMPORT_BY_FI"]
  },
  {
    path: "/fi-users/edit/:id",
    element: <FIUserAddEdit isEdit={false} />,
    isPrivate: true,
    layoutType: "Auth",
    module: "FI User",
    permissions: ["FI_UPDATE_CREATE_BY_SEPS", "FI_UPDATE_CREATE_BY_FI"]
  },
  {
    path: "/fi-users/import",
    element: <ImportFIUser isEdit={false} />,
    isPrivate: true,
    module: "FI User",
    layoutType: "Auth",
    permissions: ["FI_USER_IMPORT_BY_SEPS", "FI_USER_IMPORT_BY_FI"]
  },
  {
    path: "/reports/audit-trail",
    element: <AuditLogs />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Audit Trails",
    permissions: ["AUDIT_TRAILS_VIEW"]
  },
  {
    path: "/reports/audit-trail/:id",
    element: <ViewAuditTrail />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Audit Trails",
    permissions: ["AUDIT_TRAILS_VIEW"]
  },
  {
    path: "/reports/sla-compliance",
    element: <SLAComplianceReport />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Reports",
    permissions: ["SLA_COMPLIANCE", "SLA_COMPLIANCE_BY_FI"]
  },
  {
    path: "/reports/claim-overview",
    element: <ClaimOverviewReport />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Reports",
    permissions: ["CLAIM_OVERVIEW_REPORT", "CLAIM_OVERVIEW_REPORT_BY_FI"]
  },
  {
    path: "*",
    element: <NotFoundPage />,
    isPrivate: false,
    layoutType: "Blank",
  },
  {
    path: "/tickets",
    element: <TicketsList />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Ticket",
    permissions: [
      "TICKET_CREATED_BY_SEPS",
      "TICKET_UPDATED_BY_SEPS",
      "TICKET_CREATED_BY_FI",
      "TICKET_UPDATED_BY_FI",
      "TICKET_CHANGE_STATUS_BY_FI",
      "TICKET_CHANGE_STATUS_BY_SEPS",
      "TICKET_ASSIGNED_TO_AGENT_FI",
      "TICKET_ASSIGNED_TO_AGENT_SEPS",
      "TICKET_CLOSED_FI",
      "TICKET_REJECT_FI",
      "TICKET_PRIORITY_CHANGE_FI",
      "TICKET_DOWNLOAD_PDF_FI",
      "TICKET_CLOSED_SEPS",
      "TICKET_REJECT_SEPS",
      "TICKET_PRIORITY_CHANGE_SEPS",
      "TICKET_DOWNLOAD_PDF_SEPS",
      "TICKET_DATE_EXTENSION_FI",
      "TICKET_DATE_EXTENSION_SEPS",
      "TICKET_REPLY_TO_CUSTOMER_FI",
      "TICKET_REPLY_TO_CUSTOMER_SEPS",
      "TICKET_REPLY_TO_INTERNAL_FI",
      "TICKET_REPLY_TO_INTERNAL_SEPS",
      "TICKET_INTERNAL_NOTE_FI",
      "TICKET_INTERNAL_NOTE_SEPS",
      "TICKET_VIEW_ALL_SEPS",
      "TICKET_VIEW_ALL_FI"
    ]
  },
  {
    path: "/tickets/view/:id",
    element: <TicketsView />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Ticket",
    permissions: ["TICKET_CHANGE_STATUS_BY_FI",
      "TICKET_CHANGE_STATUS_BY_SEPS",
      "TICKET_ASSIGNED_TO_AGENT_FI",
      "TICKET_ASSIGNED_TO_AGENT_SEPS",
      "TICKET_CLOSED_FI",
      "TICKET_REJECT_FI",
      "TICKET_PRIORITY_CHANGE_FI",
      "TICKET_DOWNLOAD_PDF_FI",
      "TICKET_CLOSED_SEPS",
      "TICKET_REJECT_SEPS",
      "TICKET_PRIORITY_CHANGE_SEPS",
      "TICKET_DOWNLOAD_PDF_SEPS",
      "TICKET_DATE_EXTENSION_FI",
      "TICKET_DATE_EXTENSION_SEPS",
      "TICKET_REPLY_TO_CUSTOMER_FI",
      "TICKET_REPLY_TO_CUSTOMER_SEPS",
      "TICKET_REPLY_TO_INTERNAL_FI",
      "TICKET_REPLY_TO_INTERNAL_SEPS",
      "TICKET_INTERNAL_NOTE_FI",
      "TICKET_INTERNAL_NOTE_SEPS",
      "TICKET_VIEW_ALL_SEPS",
      "TICKET_VIEW_ALL_FI"
    ]
  },
  {
    path: "/tickets/add",
    element: <CreateClaim />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Ticket",
    permissions: ["TICKET_CREATED_BY_SEPS", "TICKET_CREATED_BY_FI"]
  },
  {
    path: "/team-management",
    element: <TeamManagementList />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Teams Manage",
    permissions: ["TEAMS_CREATE_BY_SEPS",
      "TEAMS_UPDATED_BY_SEPS",
      "TEAMS_CHANGE_STATUS_BY_SEPS",
      "TEAMS_CREATE_BY_FI",
      "TEAMS_CHANGE_STATUS_BY_FI",
      "TEAMS_UPDATED_BY_FI"]
  },
  {
    path: "/team-management/add",
    element: <TeamManagementAddEdit />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Teams Manage",
    permissions: ["TEAMS_CREATE_BY_SEPS", "TEAMS_CREATE_BY_FI"]
  },
  {
    path: "/team-management/edit/:id",
    element: <TeamManagementAddEdit />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Teams Manage",
    permissions: ["TEAMS_UPDATED_BY_SEPS", "TEAMS_UPDATED_BY_FI"]
  },
  {
    path: "/tickets-workflow",
    element: <TicketWorkFlowList />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Ticket Workflow",
    permissions: ["TICKET_WF_CREATED_BY_SEPS",
      "TICKET_WF_UPDATED_BY_SEPS",
      "TICKET_WF_CHANGE_STATUS_BY_SEPS",
      "TICKET_WF_CREATED_BY_FI",
      "TICKET_WF_UPDATED_BY_FI",
      "TICKET_WF_CHANGE_STATUS_BY_FI"
    ],
  },
  {
    path: "/tickets-workflow/add",
    element: <TicketWorkFlowAddEdit />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Ticket Workflow",
    permissions: ["TICKET_WF_CREATED_BY_SEPS", "TICKET_WF_CREATED_BY_FI"]
  },
  {
    path: "/tickets-workflow/edit/:id",
    element: <TicketWorkFlowAddEdit />,
    isPrivate: true,
    layoutType: "Auth",
    module: "Ticket Workflow",
    permissions: ["TICKET_WF_UPDATED_BY_SEPS", "TICKET_WF_UPDATED_BY_FI"]
  },
];

export default routes;
