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
            <Nav.Item as="li">
              <Nav.Link
                as={Link}
                to="/contacto"
                className="p-0 custom-font-size-12 link-light text-uppercase"
              >
                CONTACTO
              </Nav.Link>
            </Nav.Item>
            <span aria-hidden={true}>|</span>
            <Nav.Item as="li">
              <Nav.Link
                as={Link}
                to="https://www.contactociudadano.gob.ec"
                target="_blank"
                className="p-0 custom-font-size-12 link-light text-uppercase"
              >
                CONTACTO CIUDADANO
              </Nav.Link>
            </Nav.Item>
            <span aria-hidden={true}>|</span>
            <Nav.Item as="li">
              <Nav.Link
                as={Link}
                to="https://mail.seps.gob.ec/owa"
                target="_blank"
                className="p-0 custom-font-size-12 link-light text-uppercase"
              >
                WEBMAIL
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col>
          <Nav as="ul" className="gap-3 justify-content-center">
            <Nav.Item as="li">
              <AppTooltip title="Facebook">
                <Nav.Link
                  as={Link}
                  to="https://www.facebook.com/SEPSECUADOR"
                  target="_blank"
                  className="p-0 fs-6 link-light"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </Nav.Link>
              </AppTooltip>
            </Nav.Item>
            <Nav.Item as="li">
              <AppTooltip title="X">
                <Nav.Link
                  as={Link}
                  to="https://twitter.com/SEPS_Ec"
                  target="_blank"
                  className="p-0 fs-6 link-light"
                  aria-label="X"
                >
                  <FaXTwitter />
                </Nav.Link>
              </AppTooltip>
            </Nav.Item>

            <Nav.Item as="li">
              <AppTooltip title="LinkedIn">
                <Nav.Link
                  as={Link}
                  to="https://www.linkedin.com/company/superintendencia-de-economia-popular-y-solidaria"
                  target="_blank"
                  className="p-0 fs-6 link-light"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn />
                </Nav.Link>
              </AppTooltip>
            </Nav.Item>
            <Nav.Item as="li">
              <AppTooltip title="Youtube">
                <Nav.Link
                  as={Link}
                  to="https://www.youtube.com/user/SEPSEcuador"
                  target="_blank"
                  className="p-0 fs-6 link-light"
                  aria-label="Youtube"
                >
                  <FaYoutube />
                </Nav.Link>
              </AppTooltip>
            </Nav.Item>
            <Nav.Item as="li">
              <AppTooltip title="Flickr">
                <Nav.Link
                  as={Link}
                  to="https://www.flickr.com/photos/seps_ec/albums"
                  target="_blank"
                  className="p-0 fs-6 link-light"
                  aria-label="Flickr"
                >
                  <FaFlickr />
                </Nav.Link>
              </AppTooltip>
            </Nav.Item>
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
