import React, { useState } from "react";
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap";
import { MdEditDocument } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import homeBg from "../../assets/images/home-bg.jpg";
import Loader from "../../components/Loader";
import SvgIcons from "../../components/SVGIcons";
import { toggleChatbot } from "../../redux/slice/helpDeskSlice";
import FileClaimMainModal from "../auth";
import BrandSection from "./brandSection";
import { useTranslation } from "react-i18next";

const Home = () => {
  const dispatch = useDispatch();

  const {t} = useTranslation()
  // GET IS LOGGED IN STATUS OF USER FROM REDUX
  const { isLoggedIn } = useSelector((state) => state?.authSlice)

  // THIS STATE IS FOR OPEN MAIN MODAL IF USER NOT LOGGED IN
  const [fileClaimMainModalShow, setFileClaimMainModalShow] = useState(false);
  // THIS STATE IS FOR OPEN FILE CLAIM MODAL DIRECTLY IF USER IS LOGGED IN
  const [isFileClaimModalShow, setIsFileClaimModalShow] = useState(false);

  //Handle Privacy Modal
  const handleFileClaimBtn = () => {
    if (isLoggedIn) {
      setIsFileClaimModalShow(true)
    } else {
      setFileClaimMainModalShow(true);
    }
  };

  return (
    <React.Fragment>
      <Loader isLoading={false} />
      <div className="d-flex flex-column flex-grow-1 position-relative w-100 z-1">
        <Image
          src={homeBg}
          alt={t("HOMEPAGE_BACKGROUND_ALT")}
          className="h-100 object-fit-cover pe-none position-absolute start-0 top-0 user-select-none w-100 z-n1"
        />
        <Container className="my-auto">
          <Row className="justify-content-end">
            <Col sm="auto">
              <Card className="bg-primary-90 rounded-4 border-0 text-white mw-100 custom-width-400 my-5">
                <Card.Body className="p-4">
                  <div className="fw-bold text-uppercase pt-1">
                    {t("ANY_DOUBTS")} 
                  </div>
                  <h1 className="fs-4 fw-bold text-uppercase">
                    {t("FILE_CLAIM_OR_INQUIRE")}
                  </h1>
                  <p className="small fw-medium pb-1">
                   {t("FILE_CLAIM_DESCRIPTION")}
                  </p>
                  <Row className="flex-wrap g-3 pb-2">
                    <Col>
                      <Button
                        type="button"
                        variant="warning"
                        className="text-uppercase w-100 text-nowrap fw-bold"
                        size="lg"
                        onClick={handleFileClaimBtn}
                      // disabled={true}
                      >
                        <span aria-hidden={true} className="me-1">
                          <MdEditDocument size={17} />
                        </span>
                        <span className="align-middle">{t("FILE_A_CLAIM")}</span>
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="button"
                        variant="outline-dark"
                        className="text-uppercase w-100 text-nowrap fw-bold bg-white border-white text-body"
                        size="lg"
                        onClick={() => dispatch(toggleChatbot())}
                      >
                        <span aria-hidden={true} className="me-1">
                          {SvgIcons.RobotIcon()}
                        </span>
                        <span className="align-middle">{t("INQUIRY")}</span>
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

      {/* File a Claim Main Modal */}
      <FileClaimMainModal
        handleShow={fileClaimMainModalShow}
        handleClose={() => setFileClaimMainModalShow(false)}
        isFileClaimModalShow={isFileClaimModalShow}
        setIsFileClaimModalShow={setIsFileClaimModalShow}
      />
    </React.Fragment>
  );
};

export default Home;
