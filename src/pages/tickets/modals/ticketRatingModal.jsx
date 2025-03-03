import React from "react";
import { Col, Modal, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaStar } from "react-icons/fa";
const TicketRatingModal = ({ ticketData, modal, toggle }) => {

  const { t } = useTranslation()

  return <Modal

    show={modal}
    onHide={toggle}
    backdrop="static"
    keyboard={false}
    centered={true}
    scrollable={true}
    size="md"
    className="theme-modal"
    enforceFocus={false}

  >
    <Modal.Header className="pb-1" closeButton>
      <Modal.Title as="h4" className="fw-semibold">{t("SATISFACTION_SURVEY")}</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-break">
      <Row className="mb-3">
        <Col>
          <p className="mb-0">{t('CLAIM_SURVEY_QUE_1')}</p>
          <div>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar
                key={index}
                className={`me-1 ${index < ticketData?.survey?.easeOfFindingInfo ? 'text-orange' : 'text-secondary'}`}
              />
            ))}
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <p className="mb-0">{t('CLAIM_SURVEY_QUE_2')}</p>
          <div>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar
                key={index}
                className={`me-1 ${index < ticketData?.survey?.providedFormats ? 'text-orange' : 'text-secondary'}`}
              />
            ))}
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <p className="mb-0">{t('CLAIM_SURVEY_QUE_3')}</p>
          <div>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar
                key={index}
                className={`me-1 ${index < ticketData?.survey?.responseClarity ? 'text-orange' : 'text-secondary'}`}
              />
            ))}
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <p className="mb-0">{t('CLAIM_SURVEY_QUE_4')}</p>
          <div>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar
                key={index}
                className={`me-1 ${index < ticketData?.survey?.attentionTime ? 'text-orange' : 'text-secondary'}`}
              />
            ))}
          </div>
        </Col>
      </Row>
    </Modal.Body>
  </Modal>;
};

export default TicketRatingModal;
