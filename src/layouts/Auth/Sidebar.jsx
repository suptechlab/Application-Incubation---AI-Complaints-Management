import React, { useEffect, useState, useRef } from "react"
import { Button, Nav, Navbar } from "react-bootstrap"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"
import { MdOutlineArrowDropDown, MdOutlineArrowRight } from "react-icons/md"
import { NavLink, useNavigate } from "react-router-dom"
import { FaChevronDown } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { NavItems } from "./NavItems"
import "./sidebar.scss"
import { isAdminUser, getPermissionsModuleNameList } from "../../utils/authorisedmodule"
import { getLocalStorage } from "../../utils/storage"

  const Sidebar = ({ isActiveSidebar, toggleSidebarButton }) => {
  const navigate = useNavigate()
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(null)

  const handleSubmenu = idx => {
    if (isSubMenuOpen === idx) {
      setIsSubMenuOpen(null)
    } else {
      setIsSubMenuOpen(idx)
    }
  }
  const companyTitle = getLocalStorage("companyTitle");

  const permission = useRef({
    list: [],
    isAdmin: false
  });

  useEffect(() => {
    isAdminUser().then(response => {
      if (response) {
            permission.current.isAdmin = true;
      } else {
        getPermissionsModuleNameList().then(response => {
            permission.current.list = response;
        }).catch(error => {
            console.error("Error fetching permissions:", error);
        });
      }
    }).catch(error => {
            console.error("Error get during to fetch User Type", error);
    })

  }, []);

  useEffect(() => {
    if (isActiveSidebar) {
      toggleSidebarButton()
    }
  }, [navigate])

  return (
    <div className={`sidebarMenu ${isActiveSidebar ? "sidebarAction" : ""}`}>
      <Button
        variant="link"
        onClick={toggleSidebarButton}
        className="align-items-center bg-white border border-2 btn d-xl-flex h-20 justify-content-center mt-2 p-0 position-absolute rounded-circle start-100 top-0 translate-middle-x w-20 z-2 toogle-button d-none"
        aria-label="Toggle Sidebar Menu"
      >
        {isActiveSidebar ? (
          <IoIosArrowForward color="#ABABAB" size={12} />
        ) : (
          <IoIosArrowBack color="#ABABAB" size={12} />
        )}
      </Button>

      <Navbar
        bg="dark"
        data-bs-theme="dark"
        variant="dark"
        expand="xxl"
        className="w-100 h-100 p-0"
      >
        <div className="d-flex flex-column w-100 h-100">
          <div className="overflow-x-hidden bg-info overflow-y-auto sidebarList h-100">
            <Nav
              defaultActiveKey="/dashboard"
              as="ul"
              className="flex-column p-2"
            >
              {NavItems.map(elem => {
                const { id, menuName, title, menuIcon, path, subMenu, disabled, roleName } = elem

                 

                return (
                  <Nav.Item as="li" key={id}>
                    {(permission.current.isAdmin || permission.current.list.includes(roleName)) ? !subMenu && (
                      <Nav.Link
                        key={menuName}
                        id={id}
                        as={NavLink}
                        to={path}
                        className={`align-items-center d-flex  text-white sidebarLink text-nowrap rounded ${disabled ? "disabled opacity-25" : ""
                          }`}
                        onClick={() => setIsSubMenuOpen(null)}
                      >
                        <span className="py-1 text-center min-w-44 sidebarIcon">
                          {menuIcon}
                        </span>
                        <span className="hideInSmallSidebar text-white fs-15 fw-normal">{title}</span>
                      </Nav.Link>
                    ) : ''}
                    {permission.current.isAdmin || permission.current.list.includes(roleName) ? subMenu && (
                      
                       <Nav.Link
                          key={menuName}
                          as={Button}
                          variant="link"
                          onClick={() => handleSubmenu(id)}
                          className={`align-items-center d-flex text-white sidebarLink text-nowrap rounded w-100 ${isSubMenuOpen === id ? "active" : ""
                            } ${disabled ? "disabled opacity-25" : ""}`}
                        >
                          <span className="py-1 text-center min-w-44 sidebarIcon">
                            {menuIcon}
                          </span>
                          <span className="hideInSmallSidebar text-white fs-15 fw-normal">{title}</span>
                          <span className="sub-menu-arrow text-white">
                            {isSubMenuOpen === id ? (
                              <FaChevronRight size={16} />
                            ) : (
                              <FaChevronDown size={16} />

                            )}
                          </span>
                        </Nav.Link>


                    ) : ''}

                    {isSubMenuOpen === id && subMenu && (
                      <Nav as="ul" className="flex-column p-0">
                        {subMenu.map(subItems => {
                          return (
                            <Nav.Item as="li" key={subItems.id}>
                              {(permission.current.isAdmin || permission.current.list.includes(subItems.roleName)) ?

                                <Nav.Link
                                  key={subItems.menuName}
                                  as={NavLink}
                                  to={subItems.path}
                                  className={`align-items-center d-flex text-white sidebarLink text-nowrap rounded ${subItems.disabled ? "disabled opacity-25" : ""
                                    }`}
                                >{console.log('subItems.path', subItems.path)}
                                  <span className="py-1 text-center min-w-44 sidebarIcon d-none ps-1">
                                    {subItems.menuIcon}
                                  </span>
                                  <span className="hideInSmallSidebar text-white fs-15 fw-normal text-wrap">
                                    {subItems.menuName}
                                  </span>
                                </Nav.Link>
                                : ''}
                            </Nav.Item>
                          )
                        })}
                      </Nav>
                    )}
                  </Nav.Item>
                )
              })}
            </Nav>
          </div>
        </div>
      </Navbar>
    </div>
  )
}
export default Sidebar
