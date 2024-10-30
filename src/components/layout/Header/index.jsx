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
  return (
    <header className="theme-header">
      <Navbar
        key={expand}
        expand={expand}
        className="bg-body-tertiary py-0"
      >
        <Container fluid className="custom-min-height-70 px-3">
          <Navbar.Toggle
            aria-controls={`headerNavbar-expand-${expand}`}
            className="p-0 border-0 me-2"
          />

          <Navbar.Brand as={Link} href="/" className="me-auto px-1">
            <Image fluid src={Logo} alt="Logo" width={258} height={55} />
          </Navbar.Brand>

          <Navbar.Offcanvas
            id={`headerNavbar-expand-${expand}`}
            aria-labelledby={`headerNavbarLabel-expand-${expand}`}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`headerNavbarLabel-expand-${expand}`}>
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end align-items-center flex-grow-1 pe-md-3">
                <Nav.Link as={NavLink} to="/menu-1">
                  Menu 1
                </Nav.Link>
                <Nav.Link as={NavLink} to="/menu-2">
                  Menu 2
                </Nav.Link>
                <Nav.Link as={NavLink} to="/menu-3">
                  Menu 3
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>

          <Dropdown>
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
              <Dropdown.Header className="fw-semibold d-md-none">Alex Boston</Dropdown.Header>
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
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
