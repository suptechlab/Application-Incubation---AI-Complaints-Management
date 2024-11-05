import React, { useState } from "react";
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap";
import { MdEditDocument } from "react-icons/md";
import homeBg from "../../assets/images/home-bg.jpg";
import Loader from "../../components/Loader";
import SvgIcons from "../../components/SVGIcons";
import BrandSection from "./brandSection";
import PrivacyModal from "../auth/privacy";

const Home = () => {
  const [privacyModalShow, setPrivacyModalShow] = useState(false);

  //Handle Privacy Modal
  const handlePrivacyClick = () => {
    setPrivacyModalShow(true);
  };

  return (
    <React.Fragment>
      <Loader isLoading={false} />
      <div className="d-flex flex-column flex-grow-1 position-relative w-100 z-1">
        <Image
          src={homeBg}
          alt="Homepage Background Cover"
          className="h-100 object-fit-cover pe-none position-absolute start-0 top-0 user-select-none w-100 z-n1"
        />
        <Container className="my-auto">
          <Row className="justify-content-end">
            <Col sm="auto">
              <Card className="bg-primary-90 rounded-4 border-0 text-white mw-100 custom-width-400 my-5">
                <Card.Body className="p-4">
                  <div className="fw-bold text-uppercase pt-1">
                    Any Doubts ?
                  </div>
                  <h1 className="fs-4 fw-bold text-uppercase">
                    File a Claim or Inquire us
                  </h1>
                  <p className="small fw-medium pb-1">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    bibendum nibh vel volutpat condimentum. Nullam nec libero
                    leo.
                  </p>
                  <Row className="flex-wrap g-3 pb-2">
                    <Col>
                      <Button
                        type="button"
                        variant="warning"
                        className="text-uppercase w-100 text-nowrap fw-bold text-body"
                        size="lg"
                        onClick={handlePrivacyClick}
                      >
                        <span aria-hidden={true} className="me-1">
                          <MdEditDocument size={17} />
                        </span>
                        <span className="align-middle">FILE A CLAIM</span>
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="button"
                        variant="outline-dark"
                        className="text-uppercase w-100 text-nowrap fw-bold bg-white border-white text-body"
                        size="lg"
                      >
                        <span aria-hidden={true} className="me-1">
                          {SvgIcons.RobotIcon()}
                        </span>
                        <span className="align-middle">Inquiry</span>
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <BrandSection />

      <PrivacyModal
        handleShow={privacyModalShow}
        handleClose={() => setPrivacyModalShow(false)}
      />
    </React.Fragment>
  );
};

export default Home;
