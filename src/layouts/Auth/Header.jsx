import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Dropdown,
  Image,
  Nav,
  Navbar,
  Stack,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaCaretDown } from "react-icons/fa";
import {
  MdAccountBox,
  MdClose,
  MdKey,
  MdLogout,
  MdOutlineNotifications,
} from "react-icons/md";
import { Link } from "react-router-dom";
import defaultAvatar from "../../assets/images/default-avatar.jpg";
import Logo from "../../assets/images/logo.svg";
import AppTooltip from "../../components/tooltip";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { handleCountNotifications, handleDeleteAllNotification, handleDeleteNotification, handleGetNotifications, handleMarkAllNotifications, handleMarkNotificationById } from "../../services/notification.service";
import "./header.scss";
import moment from "moment/moment";

export default function Header({ isActiveSidebar, toggleSidebarButton }) {
  const { logout, userData, profileImage } = useContext(AuthenticationContext);
  const { t } = useTranslation();


  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationCount] = useState({ count: 1 });

  const [loadingNotification, setLoadingNotification] = useState(true)


  // Default values to handle missing user data
  const { imageUrl = '', firstName = '' } = userData || {};

  // GET ALL NOTIFICATIONS
  const getAllNotifications = () => {
    setLoadingNotification(true)
    handleGetNotifications().then(response => {
      setNotifications(response?.data)
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
    }).finally(() => {
      setLoadingNotification(false)
    })
  }

  // READ SINGLE NOTIFICATION
  const readSingleNotification = (notificationId) => {
    setLoadingNotification(true)
    handleMarkNotificationById(notificationId).then(response => {
      getAllNotifications()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
      setLoadingNotification(false)
    })
  }

  // READ ALL NOTIFICATIONS
  const readAllNotifications = () => {
    setLoadingNotification(true)
    handleMarkAllNotifications().then(response => {
      getAllNotifications()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
      setLoadingNotification(false)
    })
  }

  // READ SINGLE NOTIFICATION
  const deleteSingleNotification = (notificationId) => {
    setLoadingNotification(true)
    handleDeleteNotification(notificationId).then(response => {
      getAllNotifications()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
      setLoadingNotification(false)
    })
  }

  // READ ALL NOTIFICATIONS
  const deleteAllNotifications = () => {
    setLoadingNotification(true)
    handleDeleteAllNotification().then(response => {
      getAllNotifications()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
      setLoadingNotification(false)
    })
  }

  // READ ALL NOTIFICATIONS
  const noticationCountApi = () => {
    handleCountNotifications().then(response => {
      setNotificationCount(response?.data)
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
    })
  }

  useEffect(() => {
    noticationCountApi()
    getAllNotifications()
  }, [])

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
                  <span className="visually-hidden">{t("UNREAD_NOTIFICATIONS")}</span>
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu
              align="end"
              className="shadow-lg rounded-3 border-0 mt-3 theme-notification-menu"
            >
              <ul className="list-unstyled p-1 theme-custom-scrollbar overflow-auto m-0">
                <li className="fs-14 d-flex align-items-center justify-content-between px-3 py-1 border-bottom mb-1 pb-2 border-secondary border-opacity-25 ">
                  {notificationsCount.count > 0 ? (
                    <>
                      <Button
                        onClick={readAllNotifications}
                        variant="link"
                        className="link-primary text-decoration-none p-0 border-0 fw-semibold"
                      >
                        {t("MARK_ALL_AS_READ")}
                      </Button>
                      <Button
                        onClick={deleteAllNotifications}
                        variant="link"
                        className="link-primary text-decoration-none p-0 border-0 fw-semibold"
                      >
                        {t("CLEAR_ALL")}
                      </Button>
                    </>
                  ) : (
                    t("NO_NOTIFICATION")
                  )}
                </li>

                {
                  notifications.map((notification) => (
                    <li key={notification?.notification?.id} className='my-1'
                    >
                      {
                        !notification?.isRead ?
                          <button
                            className="text-wrap px-3 py-1 w-100 border-0 bg-transparent text-start"
                            type="button"
                            onClick={() => {
                              readSingleNotification(notification?.id)
                            }}>
                            <Stack direction="horizontal" gap={2} className="w-100">
                              <div className={`fs-14 fw-semibold mb-1 me-auto position-relative  text-primary`}>
                                {notification?.notification?.title}
                              </div>
                              <AppTooltip title={t("CLEAR")}>
                                <Button variant="link" className="link-danger p-0 border-0"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent parent click event
                                    deleteSingleNotification(notification.id);
                                  }}>
                                  <MdClose
                                    size={20}
                                    className="ms-2"
                                  />
                                </Button>
                              </AppTooltip>
                            </Stack>
                            <p className={`fs-14 mb-0 lh-sm ${notification?.isRead && 'text-secondary'}`}>{notification?.notification?.message}</p>
                            <small className="text-muted">{moment(notification?.notification?.createdAt).fromNow()}</small>
                          </button>
                          :
                          <div
                            className="text-wrap px-3 py-1 w-100 border-0 bg-transparent text-start"
                          >
                            <Stack direction="horizontal" gap={2} className="w-100">
                              <div className={`fs-14 fw-semibold mb-1 me-auto position-relative text-secondary}`}>
                                {notification?.notification?.title}
                              </div>
                              <AppTooltip title={t("CLEAR")}>
                                <Button variant="link" className="link-danger p-0 border-0"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent parent click event
                                    deleteSingleNotification(notification.id);
                                  }}>
                                  <MdClose
                                    size={20}
                                    className="ms-2"
                                  />
                                </Button>
                              </AppTooltip>
                            </Stack>
                            <p className={`fs-14 mb-0 lh-sm ${notification?.isRead && 'text-secondary'}`}>{notification?.notification?.message}</p>
                            <small className="text-muted">{moment(notification?.notification?.createdAt).fromNow()}</small>
                          </div>
                      }

                    </li>
                  ))
                }


                {/* {
               } */}
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
                src={profileImage ? profileImage : (imageUrl && imageUrl != null) ? imageUrl : defaultAvatar}
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
              <Dropdown.Item as={Button} onClick={logout}>
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
