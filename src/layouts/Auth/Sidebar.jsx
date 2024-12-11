import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Nav, Navbar } from "react-bootstrap";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { NavLink } from "react-router-dom";

import { NavItems } from "./NavItems";
import "./sidebar.scss";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { filterNavItemsByModules } from "../../utils/permissionUtils";

const Sidebar = ({ isActiveSidebar, toggleSidebarButton }) => {

  const { authorities = [] , permissions = [] } = useContext(AuthenticationContext);
  const navItemsArr = NavItems();
  const [navItems, setNavItems] = useState([]);
  useEffect(() => {
    if (authorities?.length > 0) {
      const adminStatus = authorities.includes("ROLE_ADMIN");
      if (adminStatus === true) {
        setNavItems(navItemsArr ?? [])
      } else {
        // FILTER NAV ITEMS HERE
        // Ensure filterNavItemsByModules is called only when both navItemsArr and roles[0]?.modules are available
        if (navItemsArr && permissions && permissions?.length > 0) {
          const filteredNavItems = filterNavItemsByModules(navItemsArr, permissions[0]?.modules);
          setNavItems(filteredNavItems ?? []);
        } else {
          setNavItems([]); // Fallback to unfiltered navItemsArr
        }
      }
    }
  }, [authorities])

  const sidebarRef = useRef(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(null);
  const handleSubmenu = (idx) => {
    if (isSubMenuOpen === idx) {
      setIsSubMenuOpen(null);
    } else {
      setIsSubMenuOpen(idx);
    }
  };

  const handleToggleSidebar = () => {
    if (isSubMenuOpen !== null && isActiveSidebar === false) {
      setIsSubMenuOpen(null);
    }
    toggleSidebarButton();
  };

  const handleNavLinkClick = () => {
    if (isActiveSidebar) {
      setIsSubMenuOpen(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isActiveSidebar &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSubMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActiveSidebar]);



  return (
    <div
      ref={sidebarRef}
      className={`sidebarMenu ${isActiveSidebar ? "sidebarAction" : ""}`}
    >
      <Button
        variant="link"
        onClick={handleToggleSidebar}
        className="align-items-center bg-white border border-1 btn d-xl-flex h-20 justify-content-center mt-2 p-0 position-absolute rounded-circle start-100 top-0 translate-middle-x w-20 z-2 toogle-button d-none"
        aria-label="Toggle Sidebar Menu"
      >
        {isActiveSidebar ? (
          <IoIosArrowForward size={12} />
        ) : (
          <IoIosArrowBack size={12} />
        )}
      </Button>
      <Navbar
        bg="primary"
        variant="dark"
        expand="xxl"
        className="w-100 h-100 p-0"
      >
        <div className="d-flex flex-column w-100 h-100">
          <div className="overflow-x-hidden overflow-y-auto sidebarList">
            <Nav defaultActiveKey="/admin" as="ul" className="flex-column p-2">
              {navItems?.map((elem) => {
                const {
                  id,
                  menuName,
                  title,
                  menuIcon,
                  path,
                  subMenu,
                  disabled,
                  roleName,
                } = elem;
                return (
                  <Nav.Item as="li" key={id}>
                    {!subMenu && (
                      <Nav.Link
                        key={menuName}
                        id={id}
                        as={NavLink}
                        to={path}
                        className={`align-items-center d-flex px-0 sidebarLink rounded ${disabled ? "disabled" : ""
                          }`}
                        onClick={handleNavLinkClick}
                      >
                        <span className="py-1 text-center min-w-44 sidebarIcon">
                          {menuIcon}
                        </span>
                        <span className="hideInSmallSidebar text-wrap lh-sm">
                          {title}
                        </span>
                      </Nav.Link>
                    )}




                    {subMenu && (
                      <Nav.Link
                        key={menuName}
                        as={Button}
                        variant="link"
                        onClick={() => handleSubmenu(id)}
                        className={`align-items-center d-flex px-0 sidebarLink rounded w-100 text-white ${isSubMenuOpen === id ? "active" : ""
                          } ${disabled ? "disabled" : ""}`}
                      >
                        <span className="py-1 text-center min-w-44 sidebarIcon">
                          {menuIcon}
                        </span>
                        <span className="hideInSmallSidebar text-wrap text-start lh-sm">
                          {title}
                        </span>
                        <span className="ms-auto sub-menu-arrow">
                          {isSubMenuOpen === id ? (
                            <MdOutlineKeyboardArrowDown size={20} />
                          ) : (
                            <MdOutlineKeyboardArrowRight size={20} />
                          )}
                        </span>
                      </Nav.Link>
                    )}

                    {isSubMenuOpen === id && subMenu && (
                      <Nav as="ul" className="flex-column p-0">

                        {subMenu?.map((subItems) => {

                          return (
                            <Nav.Item as="li" key={subItems.id}>
                              <Nav.Link
                                key={subItems.menuName}
                                as={NavLink}
                                to={subItems.path}
                                className={`align-items-center d-flex px-0 sidebarLink rounded ${subItems.disabled ? "disabled" : ""
                                  }`}
                              >
                                <span className="py-1 text-center min-w-44 sidebarIcon d-none ps-1">
                                  {subItems.menuIcon}
                                </span>
                                <span className="hideInSmallSidebar text-wrap lh-sm">
                                  {subItems.menuName}
                                </span>
                              </Nav.Link>
                            </Nav.Item>
                          );
                        })}
                      </Nav>
                    )}
                  </Nav.Item>
                );
              })}
            </Nav>
          </div>
        </div>
      </Navbar>
    </div>
  );
};
export default Sidebar;
