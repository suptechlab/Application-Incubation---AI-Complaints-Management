import { MdDashboard, MdVisibility } from "react-icons/md"

import SvgIcons from "../../components/SVGIcons"
import { getLocalStorage } from "../../utils/storage";
import { useTranslation } from "react-i18next";

const companyTitle = getLocalStorage("companyTitle");

export const NavItems = () => {
  const { t } = useTranslation(); // use the translation hook

  return [
    {
      id: 1,
      menuName: t("DASHBOARD"),
      title: t("DASHBOARD"),
      menuIcon: SvgIcons.dashboardIcon,
      path: "/",
      disabled: false,
      roleName: "Dashboard"
    },
    {
      id: 2,
      menuName: t("MASTER MANAGEMENT"),
      title: t("MASTER MANAGEMENT"),
      menuIcon: SvgIcons.mastermanage,
      path: '#',
      moduleName: ["States", "Appointment"],
      roleName: "Master Management",
      subMenu: [
        {
          id: 1,
          menuName: t("CLAIM TYPE"),
          path: "/claim-type",
          moduleName: ["Master Management"],
          roleName: "admin"
        },
        {
          id: 2,
          menuName: t("CLAIM SUB TYPE"),
          path: "/claim-subtype",
          moduleName: ["Master Management"],
          roleName: "admin"
        },
        {
          id: 3,
          menuName: t("INQUIRY TYPE"),
          path: "/inquiry-type",
          moduleName: ["Master Management"],
          roleName: "admin"
        },
        {
          id: 4,
          menuName: t("INQUIRY SUB TYPE"),
          path: "/inquiry-subtype",
          moduleName: ["Master Management"],
          roleName: "admin"
        },
        {
          id: 5,
          menuName: t("PROVINCE MASTER"),
          path: "/province-master",
          moduleName: ["Master Management"],
          roleName: "admin"
        },
        {
          id: 6,
          menuName: t("CITY MASTER"),
          path: "/city-master",
          moduleName: ["Master Management"],
          roleName: "admin"
        },
        {
          id: 7,
          menuName: t("TEMPLATE MASTER"),
          path: "/template-master",
          moduleName: ["Master Management"],
          roleName: "admin"
        }
      ],
    },
    {
      id: 3,
      menuName: t("ROLES AND RIGHTS LIST"),
      title: t("ROLES AND RIGHTS LIST"),
      menuIcon: SvgIcons.userManagementIcon,
      path: "/role-rights",
      disabled: false,
      roleName: "RoleRights"
    }
  ];
}
