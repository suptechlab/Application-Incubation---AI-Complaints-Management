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
      roleName: "admin",
      disabled: false,
    },
    {
      id: 2,
      menuName: "user management",
      title: t("User Management"),
      menuIcon: <MdPerson size={20} />,
      path: '#',
      roleName: "admin",
      subMenu: [
        {
          id: 21,
          menuName: t("SEPS USERS"),
          title: t("SEPS USERS"),
          path: "/users",
          roleName: "user",
          disabled: true,

        },
        {
          id: 22,
          menuName: t("FI USERS"),
          title: t("FI USERS"),
          path: "/fi-users",
          roleName: "admin",
          disabled: false,
        },
        {
          id: 23,
          menuName: t("ROLES AND RIGHTS LIST"),
          title: t("ROLES AND RIGHTS LIST"),
          path: "/role-rights",
          roleName: "admin",
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
          roleName: "admin",
          disabled: false,
        },
        {
          id: 42,
          menuName: t("CLAIM SUB TYPE"),
          path: "/claim-subtype",
          moduleName: ["Master Management"],
          roleName: "admin",
          disabled: false,
        },
        {
          id: 43,
          menuName: t("INQUIRY TYPE"),
          path: "/inquiry-type",
          moduleName: ["Master Management"],
          roleName: "admin",
          disabled: false,
        },
        {
          id: 44,
          menuName: t("INQUIRY SUB TYPE"),
          path: "/inquiry-subtype",
          moduleName: ["Master Management"],
          roleName: "admin",
          disabled: false,
        },
        {
          id: 45,
          menuName: t("PROVINCE MASTER"),
          path: "/province-master",
          moduleName: ["Master Management"],
          roleName: "admin",
          disabled: false,
        },
        {
          id: 46,
          menuName: t("CITY MASTER"),
          path: "/city-master",
          moduleName: ["Master Management"],
          roleName: "admin",
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
      disabled: false,
    },
    {
      id: 6,
      menuName: t("TICKET WORKFLOW fsd"),
      title: t("TICKET WORKFLOW"),
      menuIcon: <MdSchema size={20} />,
      path: "/tickets-workflow",
      roleName: "admin",
      disabled: true,
    },
    {
      id: 7,
      menuName: t("REPORTS"),
      title: t("REPORTS"),
      menuIcon: <BsFillFileTextFill size={20} />,
      path: '#',
      moduleName: ["reports"],
      roleName: "admin",
      subMenu: [
        {
          id: 71,
          menuName: t("CLAIM OVERVIEW"),
          path: "/reports/claim-overview",
          moduleName: ["reports"],
          roleName: "admin",
          disabled: true,
        },
        {
          id: 72,
          menuName: t("SLA COMPLIANCE"),
          path: "/reports/sla-compliance",
          moduleName: ["reports"],
          roleName: "admin",
          disabled: true,
        },
        {
          id: 73,
          menuName: t("AUDIT TRAIL REPORT"),
          path: "/reports/audit-trail",
          moduleName: ["reports"],
          roleName: "admin",
          disabled: false,
        },
      ],
    }
  ];
}
