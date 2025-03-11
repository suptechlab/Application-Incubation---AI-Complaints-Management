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
      default:true,
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
          moduleName: "SEPS User",
          disabled: false,
        },
        {
          id: 22,
          menuName: t("FI USERS"),
          title: t("FI USERS"),
          path: "/fi-users",
          moduleName: "FI User",
          disabled: false,
        },
        {
          id: 23,
          menuName: t("ROLES AND RIGHTS LIST"),
          title: t("ROLES AND RIGHTS LIST"),
          path: "/role-rights",
          moduleName:'Role & Rights',
          permissions: [], // No specific permission required for admin
          disabled: false,
        },
      ],
    },
    {
      id: 3,
      menuName: t("TEAM MANAGEMENT"),
      title: t("TEAM MANAGEMENT"),
      menuIcon: <MdSupervisorAccount size={20} />,
      path: "/team-management",
      moduleName: "Teams Manage",
      disabled: false,
    },
    {
      id: 4,
      menuName: t("MASTER MANAGEMENT"),
      title: t("MASTER MANAGEMENT"),
      menuIcon: <MdFolder size={20} />,
      path: '#',
      moduleName: "Master",
      roleName: "admin",
      subMenu: [
        {
          id: 41,
          menuName: t("CLAIM TYPE"),
          path: "/claim-type",
          roleName: "admin",
          moduleName: "Claim Type Master",
          disabled: false,
        },
        {
          id: 42,
          menuName: t("CLAIM SUB TYPE"),
          path: "/claim-subtype",
          roleName: "admin",
          moduleName: "Claim Sub Type Master",
          disabled: false,
        },
        // {
        //   id: 43,
        //   menuName: t("INQUIRY TYPE"),
        //   path: "/inquiry-type",
        //   roleName: "admin",
        //   moduleName: "Inquiry Type Master",
        //   disabled: false,
        // },
        // {
        //   id: 44,
        //   menuName: t("INQUIRY SUB TYPE"),
        //   path: "/inquiry-subtype",
        //   roleName: "admin",
        //   moduleName: "Inquiry Sub Type Master",
        //   disabled: false,
        // },
        {
          id: 45,
          menuName: t("PROVINCE MASTER"),
          path: "/province-master",
          roleName: "admin",
          moduleName: "Province Master",
          disabled: false,
        },
        {
          id: 46,
          menuName: t("CITY MASTER"),
          path: "/city-master",
          roleName: "admin",
          moduleName: "City Master",
          disabled: false,
        },
        {
          id: 47,
          menuName: t("TEMPLATE MASTER"),
          path: "/template-master",
          roleName: "admin",
          moduleName: "Template Master",
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
      moduleName: 'Ticket',
      disabled: false,
    },
    {
      id: 6,
      menuName: t("TICKET WORKFLOW"),
      title: t("TICKET WORKFLOW"),
      menuIcon: <MdSchema size={20} />,
      path: "/tickets-workflow",
      roleName: "admin",
      moduleName : "Ticket Workflow",
      disabled: false,
    },
    {
      id: 7,
      menuName: t("REPORTS"),
      title: t("REPORTS"),
      menuIcon: <BsFillFileTextFill size={20} />,
      path: '#',
      moduleName: "Reports",
      subMenu: [
        {
          id: 71,
          menuName: t("CLAIM OVERVIEW"),
          path: "/reports/claim-overview",
          moduleName: "Reports",
          disabled: false,
        },
        {
          id: 72,
          menuName: t("SLA COMPLIANCE"),
          path: "/reports/sla-compliance",
          moduleName: "Reports",
          disabled: false,
        },
        {
          id: 73,
          menuName: t("AUDIT TRAIL REPORT"),
          path: "/reports/audit-trail",
          moduleName: "Audit Trails",
          disabled: false,
        },
      ],
    },
    {
      id: 8,
      menuName: t("POWER_BI_DASHBOARD"),
      title: t("POWER_BI_DASHBOARD"),
      menuIcon: <MdSchema size={20} />,
      path: "/dashboard-power-bi",
      roleName: "admin",
      moduleName : "power-bi-dashboard",
      disabled: false,
    }

  ];
}
