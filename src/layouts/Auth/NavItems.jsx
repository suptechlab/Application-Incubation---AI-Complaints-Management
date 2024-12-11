import { useTranslation } from "react-i18next";
import { MdConfirmationNumber, MdDashboard, MdFolder, MdPerson, MdSchema, MdSupervisorAccount } from "react-icons/md";
import { BsFillFileTextFill } from "react-icons/bs";

export const NavItems = () => {
  const { t } = useTranslation(); // use the translation hook

  return [
    {
      id: 1,
      menuName: "dashboard",
      title: t("DASHBOARD"),
      menuIcon: <MdDashboard size={20} />,
      path: "/dashboard",
      moduleName: "Dashboard",
      disabled: false,
    },
    {
      id: 2,
      menuName: "user management",
      title: t("User Management"),
      menuIcon: <MdPerson size={20} />,
      path: '#',
      moduleName: "user",
      subMenu: [
        {
          id: 21,
          menuName: t("SEPS USERS"),
          title: t("SEPS USERS"),
          path: "/users",
          roleName: "SEPS User",
          permissions: ["FI_USER_CREATE_BY_FI"], // Match against userRoles
          disabled: false,
        },
        {
          id: 22,
          menuName: t("FI USERS"),
          title: t("FI USERS"),
          path: "/fi-users",
          moduleName: "FI User",
          permissions: ["FI_USER_CREATE_BY_FI"],
          disabled: false,
        },
        {
          id: 23,
          menuName: t("ROLES AND RIGHTS LIST"),
          title: t("ROLES AND RIGHTS LIST"),
          path: "/role-rights",
          roleName: "admin",
          permissions: [], // No specific permission required for admin
          disabled: false,
        },
      ],
    },
    {
      id: 3,
      menuName: t("Team Management"),
      title: t("Team Management"),
      menuIcon: <MdSupervisorAccount size={20} />,
      path: "/team-management",
      roleName: "admin",
      moduleName:"Teams Manage",
      disabled: false,
    },
    {
      id: 4,
      menuName: t("MASTER MANAGEMENT"),
      title: t("MASTER MANAGEMENT"),
      menuIcon: <MdFolder size={20} />,
      path: '#',
      moduleName: ["States", "Appointment"],
      roleName: "admin",
      subMenu: [
        {
          id: 41,
          menuName: t("CLAIM TYPE"),
          path: "/claim-type",
          moduleName: ["Master Management"],
          roleName: "Claim Type Master",
          disabled: false,
        },
        {
          id: 42,
          menuName: t("CLAIM SUB TYPE"),
          path: "/claim-subtype",
          moduleName: ["Master Management"],
          roleName: "Claim Sub Type Master",
          disabled: false,
        },
        {
          id: 43,
          menuName: t("INQUIRY TYPE"),
          path: "/inquiry-type",
          moduleName: ["Master Management"],
          roleName: "Inquiry Type Master",
          disabled: false,
        },
        {
          id: 44,
          menuName: t("INQUIRY SUB TYPE"),
          path: "/inquiry-subtype",
          moduleName: ["Master Management"],
          roleName: "Inquiry Sub Type Master",
          disabled: false,
        },
        {
          id: 45,
          menuName: t("PROVINCE MASTER"),
          path: "/province-master",
          moduleName: ["Master Management"],
          roleName: "Province Master",
          disabled: false,
        },
        {
          id: 46,
          menuName: t("CITY MASTER"),
          path: "/city-master",
          moduleName: ["Master Management"],
          roleName: "City Master",
          disabled: false,
        },
        {
          id: 47,
          menuName: t("TEMPLATE MASTER"),
          path: "/template-master",
          moduleName: ["Master Management"],
          roleName: "admin",
          disabled: false,
        }
      ],
    },
    {
      id: 5,
      menuName: t("TICKETS"),
      title: t("TICKETS"),
      menuIcon: <MdConfirmationNumber size={20} />,
      path: "/tickets",
      roleName: "admin",
      moduleName : 'Ticket',
      disabled: false,
    },
    {
      id: 6,
      menuName: t("TICKET WORKFLOW"),
      title: t("TICKET WORKFLOW"),
      menuIcon: <MdSchema size={20} />,
      path: "/tickets-workflow",
      roleName: "Ticket Workflow",
      disabled: true,
    },
    {
      id: 7,
      menuName: t("REPORTS"),
      title: t("REPORTS"),
      menuIcon: <BsFillFileTextFill size={20} />,
      path: '#',
      moduleName: ["reports"],
      roleName: "Reports",
      subMenu: [
        {
          id: 71,
          menuName: t("CLAIM OVERVIEW"),
          path: "/reports/claim-overview",
          moduleName: ["reports"],
          roleName: "Reports",
          disabled: false,
        },
        {
          id: 72,
          menuName: t("SLA COMPLIANCE"),
          path: "/reports/sla-compliance",
          moduleName: ["reports"],
          roleName: "Reports",
          disabled: false,
        },
        {
          id: 73,
          menuName: t("AUDIT TRAIL REPORT"),
          path: "/reports/audit-trail",
          moduleName: ["reports"],
          roleName: "Audit Trails",
          disabled: false,
        },
      ],
    }
  ];
}
