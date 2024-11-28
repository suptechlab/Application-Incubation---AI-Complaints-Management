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
import { Link, NavLink, useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import Logo from "../../../assets/images/logo.svg";
import "./header.scss";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../../../redux/slice/authSlice";
import { useTranslation } from "react-i18next";
import { resetDPAState } from "../../../redux/slice/helpDeskSlice";
import ProfileModal from "../../../pages/profile";

const Header = ({ layout }) => {
  const [profileModalShow, setProfileModalShow] = useState(false);

  const { isLoggedIn, user } = useSelector((state) => state?.authSlice)

  const { t } = useTranslation()

  const dispatch = useDispatch()

  const navigate = useNavigate()

  let expand = "md";

  // Menu Links
  const menuLinks = [
    {
      label: t("MENU_1"),
      path: "/menu-1",
    },
    {
      label: t("MENU_2"),
      path: "/menu-2",
    },
    {
      label: t("MENU_3"),
      path: "/menu-3",
    },
  ];

  const handleLogout = () => {
    dispatch(setLogout())
    dispatch(resetDPAState())
    navigate('/')
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
                {menuLinks.map((link, index) => (
                  <Nav.Link
                    as={NavLink}
                    to={link.path}
                    className="mx-md-3"
                    key={"menu_link_" + index}
                    disabled={true}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
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
                src={defaultAvatar}
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
              <Dropdown.Item as={Button} onClick={handleProfileClick} disabled>
                {t("PROFILE")}
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/my-account">
                {t("MY ACCOUNT")}
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/change-password" disabled>
                {t("CHANGE_PASSWORD")}
              </Dropdown.Item>
              <Dropdown.Item as={Button} onClick={handleLogout}>
                {t("LOGOUT")}
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
    </header>
  );
};

export default Header;
