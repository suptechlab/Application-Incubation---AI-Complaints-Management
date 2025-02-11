import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Dropdown,
  Image,
  Nav,
  Navbar,
  Offcanvas,
  Stack,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdAccountBox, MdAccountCircle, MdClose, MdKey, MdLogout, MdOutlineNotifications } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import Logo from "../../../assets/images/logo.svg";
import FileClaimMainModal from "../../../pages/auth";
import ProfileModal from "../../../pages/profile";
import { setLogout } from "../../../redux/slice/authSlice";
import { resetDPAState } from "../../../redux/slice/helpDeskSlice";
import AppTooltip from "../../tooltip";
import "./header.scss";
import { deleteAllNotification, deleteSingleNotification, notificationCountApi, notificationListApi, readAllNotifications, readSingleNotification } from "../../../redux/slice/notificationSlice";

const Header = ({ layout }) => {
  const [profileModalShow, setProfileModalShow] = useState(false);
  const [fileClaimMainModalShow, setFileClaimMainModalShow] = useState(false);
  const [isFileClaimModalShow, setIsFileClaimModalShow] = useState(false);


  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationCount] = useState(0);

  const { isLoggedIn, user, profilePicture } = useSelector((state) => state?.authSlice)

  const { t } = useTranslation()

  const dispatch = useDispatch()

  const navigate = useNavigate()

  let expand = "md";

  const handleLogout = () => {
    dispatch(setLogout())
    dispatch(resetDPAState())
    navigate('/')
  }

  const handleLoginClick = () => {
    if (isLoggedIn) {
      setIsFileClaimModalShow(true)
    } else {
      setFileClaimMainModalShow(true);
    }
  }

  const handleProfileClick = () => {
    setProfileModalShow(true)
  }

  // GET ALL NOTIFICATIONS
  const getAllNotifications = () => {
    dispatch(notificationListApi())
      .then(result => {
        if (notificationListApi.fulfilled.match(result)) {
          setNotifications(result?.payload?.data)
        } else {
          console.error("Verification error:", result.error.message);
        }
      })
      .catch(error => {
        console.error("Error during file claim submission:", error);
      });
  }

  // READ SINGLE NOTIFICATION
  const handleReadSingleNotification = (notificationData) => {
    const { id, notification } = notificationData



    const updatedNotifications = notifications.map(notification =>
      notification.id === id
        ? { ...notification, isRead: true }
        : notification
    );

    if (notification?.redirectUrl) {
      console.log(notification?.redirectUrl)
      navigate("/" + notification?.redirectUrl)
    }

    // Update the notifications state
    setNotifications(updatedNotifications);

    // Update the notification count: subtract 1 if there's any unread notification
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    setNotificationCount(unreadCount);


    if (notification?.isRead === false) {
      dispatch(readSingleNotification(id))
        .then(result => {
          if (readSingleNotification.fulfilled.match(result)) {
            getAllNotifications()
          } else {
            console.error("Verification error:", result.error.message);
          }
        })
        .catch(error => {
          console.error("Error during file claim submission:", error);
        });
    }

  }

  // READ ALL NOTIFICATIONS
  const handleReadAllNotifications = () => {

    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }));

    // Update the notifications state
    setNotifications(updatedNotifications);
    setNotificationCount(0)


    dispatch(readAllNotifications())
      .then(result => {
        if (readAllNotifications.fulfilled.match(result)) {
          // getAllNotifications()
        } else {
          console.error("Verification error:", result.error.message);
        }
      })
      .catch(error => {
        console.error("Error during file claim submission:", error);
      });
  }

  // DELETE SINGLE NOTIFICATION
  const handleDeleteSingleNotification = (notificationId) => {
    // Remove the notification with the specified id
    const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);

    // Update the notifications state
    setNotifications(updatedNotifications);

    // Update the notification count based on remaining unread notifications
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    setNotificationCount(unreadCount);

    dispatch(deleteSingleNotification(notificationId))
      .then(result => {
        if (deleteSingleNotification.fulfilled.match(result)) {
          getAllNotifications()
        } else {
          console.error("Verification error:", result.error.message);
        }
      })
      .catch(error => {
        console.error("Error during file claim submission:", error);
      });
  }

  // READ ALL NOTIFICATIONS
  const handleDeleteAllNotifications = () => {

    // Update the notifications state
    setNotifications([]);
    setNotificationCount(0)

    dispatch(deleteAllNotification())
      .then(result => {
        if (deleteAllNotification.fulfilled.match(result)) {
          getAllNotifications()
        } else {
          console.error("Verification error:", result.error.message);
        }
      })
      .catch(error => {
        console.error("Error during file claim submission:", error);
      });
  }

  const getNotificationCount = async () => {
    try {
      const result = await dispatch(notificationCountApi());

      if (notificationCountApi.fulfilled.match(result)) {
        const newCount = parseInt(result?.payload?.data?.unreadCount, 10);

        if (newCount !== notificationsCount) {
          setNotificationCount(newCount);
          getAllNotifications(); // Call if count changes
        }
      } else {
        console.error("Verification error:", result.error.message);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {

    if (isLoggedIn) {
      getNotificationCount();
      getAllNotifications();
      const intervalId = setInterval(() => {
        getNotificationCount();
      }, 60000); // Run every 1 minute
      return () => clearInterval(intervalId); // Cleanup on unmount
    }

  }, []);


  return (
    <header className="theme-header">
      <Navbar key={expand} expand={expand} className="bg-body-tertiary py-0">
        <Container className="custom-min-height-70" fluid={layout === 'full'}>
          <Navbar.Brand as={Link} to="/" className="me-auto px-1">
            <Image fluid src={Logo} alt="Logo" width={258} height={55} />
          </Navbar.Brand>
          <Navbar.Offcanvas
            id={`headerNavbar-expand-${expand}`}
            aria-labelledby={`headerNavbarLabel-expand-${expand}`}
            placement="end"
          >
            <Offcanvas.Header closeButton className="bg-body-tertiary">
              <Offcanvas.Title
                id={`headerNavbarLabel-expand-${expand}`}
                className="fw-semibold"
              >
                t{t("MENU")}
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end align-items-md-center flex-grow-1 header-menu-links">
                {!isLoggedIn &&
                  <Button
                    type="button"
                    className="py-2 custom-min-width-90"
                    variant="warning"
                    onClick={handleLoginClick}
                  >
                    {t('LOGIN')}
                  </Button>
                }
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
          {/* NOTIFICATION */}
          {
            isLoggedIn &&
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
                      className={notificationsCount > 0 ? "ring" : ""}
                    />
                  </span>
                </AppTooltip>
                {notificationsCount > 0 && (
                  <Badge
                    bg="dark"
                    className="border border-white fw-semibold rounded-pill notification-count position-absolute top-0 start-100 translate-middle mt-2 ms-n1"
                  >
                    {notificationsCount}
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
                    {notifications?.length > 0 ? (
                      <>
                        {
                          notificationsCount > 0 ? <Button
                            onClick={handleReadAllNotifications}
                            variant="link"
                            className="link-primary text-decoration-none p-0 border-0 fw-semibold"
                          >
                            {t("MARK_ALL_AS_READ")}
                          </Button> : ''
                        }

                        <Button
                          onClick={handleDeleteAllNotifications}
                          variant="link"
                          className="link-primary text-decoration-none p-0 border-0 fw-semibold ms-auto"
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
                        <button
                          className="text-wrap px-3 py-1 w-100 border-0 bg-transparent text-start"
                          type="button"
                          onClick={() => {
                            handleReadSingleNotification(notification)
                          }}>
                          <Stack direction="horizontal" gap={2} className="w-100">
                            <div className={`fs-14 fw-semibold mb-1 me-auto position-relative ${notification?.isRead ? 'text-secondary' : 'text-primary'}`}>
                              {notification?.notification?.title}
                            </div>
                            <AppTooltip title={t("CLEAR")}>
                              <Button variant="link" className="link-danger p-0 border-0"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent parent click event
                                  handleDeleteSingleNotification(notification.id);
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

                      </li>
                    ))
                  }
                </ul>
              </Dropdown.Menu>
            </Dropdown>
          }


          <Dropdown className={`${!isLoggedIn ? 'd-none' : ''} ms-md-4`}>
            <Dropdown.Toggle
              variant="link"
              id="dropdown-profile"
              className="border-0 text-decoration-none p-0 text-body"
            >
              <Image
                className="object-fit-cover rounded-circle"
                src={profilePicture ?? defaultAvatar}
                width={40}
                height={40}
                alt={"Alex Boston"}
              />
              <span className="align-middle text-start d-none d-md-inline-block px-2 text-truncate custom-max-width-150 fs-6 lh-sm fw-semibold">
                {user?.name}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="shadow border-0 mt-3">
              <Dropdown.Header className="fw-semibold d-md-none">
                {user?.name ?? ''}
              </Dropdown.Header>
              <Dropdown.Item as={Button} onClick={handleProfileClick} className="fs-6">
                <span className="me-2">
                  <MdAccountBox size={18} />
                </span>
                <span className="align-middle">{t("PROFILE")}</span>
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/my-account">
                <span className="me-2">
                  <MdAccountCircle size={18} />
                </span>
                <span className="align-middle">{t("MY_ACCOUNT")}</span>
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/change-password" disabled>
                <span className="me-2">
                  <MdKey size={18} />
                </span>
                <span className="align-middle">{t("CHANGE_PASSWORD")}</span>
              </Dropdown.Item>
              <Dropdown.Item as={Button} onClick={handleLogout} className="fs-6">
                <span className="me-2">
                  <MdLogout size={18} />
                </span>
                <span className="align-middle">{t("LOGOUT")}</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Navbar.Toggle
            aria-controls={`headerNavbar-expand-${expand}`}
            className="p-0 border-0 ms-3"
          />
        </Container>
      </Navbar>

      {/* Profile Modal */}
      <ProfileModal
        handleShow={profileModalShow}
        handleClose={() => setProfileModalShow(false)}
      />

      {/* Login Modal */}
      <FileClaimMainModal
        handleShow={fileClaimMainModalShow}
        handleClose={() => setFileClaimMainModalShow(false)}
        isFileClaimModalShow={isFileClaimModalShow}
        setIsFileClaimModalShow={setIsFileClaimModalShow}
        isDirectLogin={true}
      />
    </header>
  );
};

export default Header;
