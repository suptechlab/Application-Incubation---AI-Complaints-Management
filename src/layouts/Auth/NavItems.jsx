import { useTranslation } from "react-i18next";
import { MdConfirmationNumber, MdDashboard, MdFolder, MdPerson, MdSchema, MdSupervisorAccount } from "react-icons/md";

export const NavItems = () => {
  const { t } = useTranslation(); // use the translation hook

  return [
    {
      id: 1,
      menuName: t("DASHBOARD"),
      title: t("DASHBOARD"),
      menuIcon: <MdDashboard size={20} />,
      path: "/",
      roleName: "admin",
      disabled: false,
    },
    {
      id: 2,
      menuName: t("USER MANAGEMENT"),
      title: t("User Management"),
      menuIcon: <MdPerson size={20} />,
      path: '#',
      roleName: "admin",
      subMenu: [
        {
          id: 21,
          menuName: t("SEPS Users"),
          title: t("SEPS Users"),
          path: "/users",
          roleName: "user",
          disabled: false,

        },
        {
          id: 22,
          menuName: t("FI Users"),
          title: t("FI Users"),
          path: "/fi-users",
          roleName: "admin",
          disabled: true,
        },
        {
          id: 23,
          menuName: t("Roles & Rights"),
          title: t("Roles & Rights"),
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
      disabled: true,
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
      id: 7,
      menuName: t("Tickets"),
      title: t("Tickets"),
      menuIcon: <MdConfirmationNumber size={20} />,
      path: "/tickets",
      roleName: "admin",
      disabled: true,
    },
    {
      id: 8,
      menuName: t("Ticket Workflow"),
      title: t("Ticket Workflow"),
      menuIcon: <MdSchema size={20} />,
      path: "/tickets-workflow",
      roleName: "admin",
      disabled: true,
    },
  ];
}
