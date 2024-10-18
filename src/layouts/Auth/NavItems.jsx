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
    roleName: "Dashboard"
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
        menuName: "State Master ",
        // menuIcon: SvgIcons.allpatients,
        path: "/states",
        moduleName: ["States", "Appointment"],
        roleName: "State Master"
      }
      
    ],
  },
  {
    id: 3,
    menuIcon: SvgIcons.allpatients,
    moduleName: ["States", "Appointment"],
    menuName: "Role & Rights",
    title: "Role & Rights",
    path: "/role-rights",
    menuIcon: SvgIcons.userManagementIcon,
    //moduleName: "Non Domestic Consumer",
    disabled: false,
    roleName: "RoleRights"
  }
  
  
  

]
