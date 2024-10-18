import { MdDashboard, MdVisibility } from "react-icons/md"

import SvgIcons from "../../components/SVGIcons"
import { getLocalStorage } from "../../utils/storage";

const companyTitle = getLocalStorage("companyTitle");

export const NavItems = [
  {
    id: 1,
    menuName: "Dashboard",
    title: "Dashboard",
    //menuIcon: <MdDashboard size={14} />,
    menuIcon: SvgIcons.dashboardIcon,
    path: "/",
    disabled: false,
    roleName: "admin"
  },
  {
    id: 2,
    menuName: "States",
    title: "Master Management",
    menuIcon: SvgIcons.mastermanage,
    path: '#',
    moduleName: ["States", "Appointment"],
    roleName: "Master Management",
    subMenu: [
      {
        id: 1,
        menuName: "Claim Type",
        // menuIcon: SvgIcons.allpatients,
        path: "/claim-type",
        moduleName: ["Master Management"],
        roleName: "admin"
      },
      {
        id: 2,
        menuName: "Claim Sub Type",
        // menuIcon: SvgIcons.allpatients,
        path: "/claim-subtype",
        moduleName: ["Master management"],
        roleName: "admin"
      },
      {
        id: 3,
        menuName: "Inquiry Type",
        // menuIcon: SvgIcons.allpatients,
        path: "/inquiry-type",
        moduleName: ["Master management"],
        roleName: "admin"
      },
      {
        id: 4,
        menuName: "Inquiry Sub type",
        // menuIcon: SvgIcons.allpatients,
        path: "/inquiry-subtype",
        moduleName: ["Master management"],
        roleName: "admin"
      },
      {
        id: 5,
        menuName: "Province Master",
        // menuIcon: SvgIcons.allpatients,
        path: "/province-master",
        moduleName: ["Master management"],
        roleName: "admin"
      },
      {
        id: 6,
        menuName: "City Master",
        // menuIcon: SvgIcons.allpatients,
        path: "/city-master",
        moduleName: ["Master management"],
        roleName: "admin"
      },
      {
        id: 7,
        menuName: "Template Master",
        // menuIcon: SvgIcons.allpatients,
        path: "/template-master",
        moduleName: ["Master management"],
        roleName: "admin"
      }
    ],
  },
]
