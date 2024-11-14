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

export default function Header({ isActiveSidebar, toggleSidebarButton }) {
  const { logout } = useContext(AuthenticationContext);

  const [notifications, setNotifications] = useState([]);
  const imageUrl = JSON.parse(localStorage.getItem("imageUrl"));
  const firstName = JSON.parse(localStorage.getItem("firstName"));
  const lastName = JSON.parse(localStorage.getItem("lastName"));
  // const companyTitle = JSON.parse(localStorage.getItem("companyTitle"));
  const companyTitle = "";
  const [notificationsCount, setNotificationsCount] = useState({
    count: 0,
  });
  const navigate = useNavigate();
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // try {
    //     fetchNotificationCount();
    //     const response = await handleGetNotifications();
    //     if (response.status === 200) {
    //         setNotifications(response.data.data);
    //     }
    // } catch (error) {
    //     console.error("Failed to fetch notifications", error);
    // }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await handleCountNotifications();
      if (response.status === 200) {
        setNotificationsCount({
          count: response.data.data.count,
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications count", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await handleMarkAllNotifications();
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      console.log("Delete called...", id);
      // await handleDeleteNotification(id);
      // fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

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
            className={`bg-dark d-inline-block menuTrigger position-relative text-center ${
              isActiveSidebar ? "active" : ""
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
                      onClick={markAllAsRead}
                      className="text-decoration-none"
                    >
                      Mark As Read
                    </Link>
                  ) : (
                    "No notification found"
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
                            onClick={() => deleteNotification(notification.id)}
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
                src={imageUrl && imageUrl != null ? imageUrl : defaultAvatar}
                width={40}
                height={40}
                alt={firstName}
              />
              <span className="align-middle text-start d-none d-md-inline-block px-2 text-truncate custom-max-width-200 fs-6 lh-sm">
                {firstName} 
                <br />
                <Badge bg="light-green-custom" className="fs-normal">
                     Administrador
                </Badge>
              </span>
              <FaCaretDown size={16} className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="shadow-lg rounded-3 border-0 mt-3">
              <Dropdown.Item as={Link} to="/profile">
                <span className="me-2">
                  <MdAccountBox size={18} />
                </span>
                <span className="align-middle">Perfil</span>
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/change-password">
                <span className="me-2">
                  <MdKey size={18} />
                </span>
                <span className="align-middle">Cambiar la contraseña</span>
              </Dropdown.Item>
              <Dropdown.Item as={Link} onClick={logout}>
                <span className="me-2">
                  <MdLogout size={18} />
                </span>
                <span className="align-middle">Cerrar sesión</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
