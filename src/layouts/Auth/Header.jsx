import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Dropdown,
  Image,
  Nav,
  Navbar,
} from "react-bootstrap";
import { FaCaretDown, FaTrash } from "react-icons/fa";
import {
  MdAccountBox,
  MdKey,
  MdLogout,
  MdOutlineNotifications,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/default-avatar.jpg";
import Logo from "../../assets/images/logo.svg";
import AppTooltip from "../../components/tooltip";
import { AuthenticationContext } from "../../contexts/authentication.context";
import {
  handleCountNotifications,
  handleMarkAllNotifications
} from "../../services/notification.service";
import "./header.scss";
import { useTranslation } from "react-i18next";

export default function Header({ isActiveSidebar, toggleSidebarButton }) {
  const { logout, userData,profileImage } = useContext(AuthenticationContext);
  const { t } = useTranslation();


  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState({ count: 0 });

  // Default values to handle missing user data
  const { imageUrl = '', firstName = '' } = userData || {};

  // const [isAdmin, setIsAdmin] = useState(false);

  // useEffect(() => {
  //   if (authorities?.length > 0) {
  //     const adminStatus = authorities.includes("ROLE_ADMIN");
  //     if (adminStatus !== isAdmin) {
  //       setIsAdmin(adminStatus);
  //     }else{
  //       // FILTER NAV ITEMS HERE
  //     }
  //   }
  // }, [authorities])

  return (
    <Navbar
      bg="white"
      data-bs-theme="light"
      variant="light"
      className="py-0 shadow-sm theme-top-header"
    >
      <Container fluid className="h-100">
        <Button
          onClick={toggleSidebarButton}
          variant="link"
          className="align-items-center d-flex d-xl-none justify-content-center me-3 navMenuBtn p-0 py-3"
          aria-label="Sidebar Toggle Button"
        >
          <span
            className={`bg-dark d-inline-block menuTrigger position-relative text-center ${isActiveSidebar ? "active" : ""
              }`}
          ></span>
        </Button>
        <Link to="/dashboard" className="me-3">
          <Image fluid src={Logo} alt="Logo" width={219} height={46} />
        </Link>
        <Nav className="ms-auto align-items-center order-md-last">
          <Dropdown className="notificationDropdown me-sm-1">
            <Dropdown.Toggle
              variant="link"
              id="notifications-dropdown"
              className="link-dark p-1 position-relative my-1"
            >
              <AppTooltip title="Notifications" placement="auto">
                <span>
                  <MdOutlineNotifications
                    size={24}
                    className={notificationsCount.count > 0 ? "ring" : ""}
                  />
                </span>
              </AppTooltip>
              {notificationsCount.count > 0 && (
                <Badge
                  bg="dark"
                  className="border border-white fw-semibold rounded-pill notification-count position-absolute top-0 start-100 translate-middle mt-2 ms-n1"
                >
                  {notificationsCount.count}
                  <span className="visually-hidden">Unread Notifications</span>
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu
              align="end"
              className="shadow-lg rounded-3 border-0 mt-3 theme-notification-menu"
            >
              <ul className="list-unstyled p-1 theme-custom-scrollbar overflow-auto m-0">
                <li className="fs-14 text-center px-3 py-1">
                  {notificationsCount.count > 0 ? (
                    <Link
                      // onClick={markAllAsRead}
                      className="text-decoration-none"
                    >
                      Mark As Read
                    </Link>
                  ) : (
                    "No se encontró ninguna notificación"
                  )}
                </li>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <Dropdown.Item as={Link} to="/">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fs-14 fw-semibold">
                            {notification.title}
                          </div>
                          <p className="fs-14 mb-0">{notification.message}</p>
                        </div>

                        <div>
                          <FaTrash
                            className="text-primary ms-2 "
                          // onClick={() => deleteNotification(notification.id)}
                          />
                        </div>
                      </div>
                    </Dropdown.Item>
                  </li>
                ))}
              </ul>
            </Dropdown.Menu>
          </Dropdown>


          <Dropdown className="profileDropdown ms-3 ms-sm-4">
            <Dropdown.Toggle
              variant="link"
              id="dropdown-profile"
              className="border-0 fw-semibold text-decoration-none p-0 text-body"
            >
              <Image
                className="object-fit-cover rounded-circle"
                src={profileImage ? profileImage : imageUrl && imageUrl != null ? imageUrl : defaultAvatar}
                width={40}
                height={40}
                alt={firstName}
              />
              <span className="align-middle text-start d-none d-md-inline-block px-2 text-truncate custom-max-width-200 fs-6 lh-sm">
                {firstName}
                <br />

                {
                  userData?.roles?.length > 0 ?
                    <Badge bg="light-green-custom" className="fs-normal">
                      {userData?.roles[0]?.name}
                    </Badge> : <Badge bg="light-green-custom" className="fs-normal">
                      {t('ADMINISTRATOR')}
                    </Badge>
                }

              </span>
              <FaCaretDown size={16} className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="shadow-lg rounded-3 border-0 mt-3">
              <Dropdown.Item as={Link} to="/profile">
                <span className="me-2">
                  <MdAccountBox size={18} />
                </span>
                <span className="align-middle">{t('PROFILE')}</span>
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/change-password">
                <span className="me-2">
                  <MdKey size={18} />
                </span>
                <span className="align-middle">{t('CHANGE_PASSWORD')}</span>
              </Dropdown.Item>
              <Dropdown.Item as={Link} onClick={logout}>
                <span className="me-2">
                  <MdLogout size={18} />
                </span>
                <span className="align-middle">{t('LOGOUT')}</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
