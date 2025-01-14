import React, { useState } from "react";
import {
  Button,
  Container,
  Dropdown,
  Image,
  Nav,
  Navbar,
  Offcanvas,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdAccountBox, MdAccountCircle, MdKey, MdLogout } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import Logo from "../../../assets/images/logo.svg";
import FileClaimMainModal from "../../../pages/auth";
import ProfileModal from "../../../pages/profile";
import { setLogout } from "../../../redux/slice/authSlice";
import { resetDPAState } from "../../../redux/slice/helpDeskSlice";
import "./header.scss";

const Header = ({ layout }) => {
  const [profileModalShow, setProfileModalShow] = useState(false);
  const [fileClaimMainModalShow, setFileClaimMainModalShow] = useState(false);
  const [isFileClaimModalShow, setIsFileClaimModalShow] = useState(false);


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
