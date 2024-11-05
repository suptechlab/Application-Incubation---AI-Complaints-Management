import React from "react";
import { Button, Col, Image, Nav, Row } from "react-bootstrap";
import {
  FaFacebookF,
  FaFlickr,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import LogoFooter from "../../../assets/images/logo-white.svg";
import AppTooltip from "../../../components/tooltip";
import SvgIcons from "../../SVGIcons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Nav Links
  const navLinks = [
    {
      label: "CONTACTO",
      url: "/contacto",
      isExternal: false,
    },
    {
      label: "CONTACTO CIUDADANO",
      url: "https://www.contactociudadano.gob.ec",
      isExternal: true,
    },
    {
      label: "WEBMAIL",
      url: "https://mail.seps.gob.ec/owa",
      isExternal: true,
    },
  ];

  // Social Links
  const socialLinks = [
    {
      title: "Facebook",
      url: "https://www.facebook.com/SEPSECUADOR",
      icon: <FaFacebookF />,
      ariaLabel: "Facebook",
    },
    {
      title: "X",
      url: "https://twitter.com/SEPS_Ec",
      icon: <FaXTwitter />,
      ariaLabel: "X",
    },
    {
      title: "LinkedIn",
      url: "https://www.linkedin.com/company/superintendencia-de-economia-popular-y-solidaria",
      icon: <FaLinkedinIn />,
      ariaLabel: "LinkedIn",
    },
    {
      title: "Youtube",
      url: "https://www.youtube.com/user/SEPSEcuador",
      icon: <FaYoutube />,
      ariaLabel: "Youtube",
    },
    {
      title: "Flickr",
      url: "https://www.flickr.com/photos/seps_ec/albums",
      icon: <FaFlickr />,
      ariaLabel: "Flickr",
    },
  ];

  return (
    <footer className="bg-dark custom-font-size-12 mt-auto p-3 position-relative text-center text-white">
      <Button
        variant="warning"
        className="align-items-center btn btn-warning custom-height-64 custom-width-64 d-inline-flex end-0 justify-content-center me-3 position-fixed rounded-pill text-center text-white z-3 help-desk-button"
        aria-label="SEPS Helpdesk"
      >
        {SvgIcons.RobotIcon(32, 32)}
      </Button>
      <Row className="align-items-center g-2">
        <Col lg="auto">
          <Nav as="ul" className="gap-1 justify-content-center">
            {navLinks?.map((link, index) => (
              <React.Fragment key={"link_" + index}>
                <Nav.Item as="li">
                  <Nav.Link
                    as={Link}
                    to={link.url}
                    target={link.isExternal ? "_blank" : undefined}
                    className="p-0 custom-font-size-12 link-light text-uppercase"
                  >
                    {link.label}
                  </Nav.Link>
                </Nav.Item>
                {index < navLinks.length - 1 && (
                  <span aria-hidden={true}>|</span>
                )}
              </React.Fragment>
            ))}
          </Nav>
        </Col>
        <Col>
          <Nav as="ul" className="gap-3 justify-content-center">
            {socialLinks?.map((link, index) => (
              <Nav.Item as="li" key={"social_Link_" + index}>
                <AppTooltip title={link.title}>
                  <Nav.Link
                    as={Link}
                    to={link.url}
                    target="_blank"
                    className="p-0 fs-6 link-light"
                    aria-label={link.ariaLabel}
                  >
                    {link.icon}
                  </Nav.Link>
                </AppTooltip>
              </Nav.Item>
            ))}
          </Nav>
          <div className="pt-2">
            <p className="mb-1">
              Dirección: Av. Amazonas N32-87 y La Granja |
              Quito&nbsp;-&nbsp;Ecuador
            </p>
            &copy; 2012-{currentYear} Superintendencia de Economía
            Popular&nbsp;y&nbsp;Solidaria
          </div>
        </Col>
        <Col lg="auto">
          <Image
            fluid
            src={LogoFooter}
            alt="Logo Footer"
            width={210}
            height={44}
          />
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
