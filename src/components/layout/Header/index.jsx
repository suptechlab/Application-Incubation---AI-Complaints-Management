import React from "react";
import {
  Container,
  Dropdown,
  Image,
  Nav,
  Navbar,
  Offcanvas,
} from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import Logo from "../../../assets/images/logo.svg";
import "./header.scss";

const Header = () => {
  let expand = "md";

  // Menu Links
  const menuLinks = [
    {
      label: "Menu 1",
      path: "/menu-1",
    },
    {
      label: "Menu 2",
      path: "/menu-2",
    },
    {
      label: "Menu 3",
      path: "/menu-3",
    },
  ];

  return (
    <header className="theme-header">
      <Navbar key={expand} expand={expand} className="bg-body-tertiary py-0">
        <Container className="custom-min-height-70">
          <Navbar.Brand as={Link} href="/" className="me-auto px-1">
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
                Menu
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
                  >
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>

          <Dropdown className="d-none ms-md-4">
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
                {"Alex Boston"}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="shadow border-0 mt-3">
              <Dropdown.Header className="fw-semibold d-md-none">
                Alex Boston
              </Dropdown.Header>
              <Dropdown.Item as={Link} to="/profile" disabled>
                Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/change-password" disabled>
                Change Password
              </Dropdown.Item>
              <Dropdown.Item as={Link} disabled>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Navbar.Toggle
            aria-controls={`headerNavbar-expand-${expand}`}
            className="p-0 border-0 ms-3"
          />
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
