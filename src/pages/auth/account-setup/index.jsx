import React from "react";
import { Button, Col, Modal, Row, Stack } from "react-bootstrap";
import { FiInfo } from "react-icons/fi";
import AppTooltip from "../../../components/tooltip";

const AccountSetupModal = () => {

    return (
        <React.Fragment>
            <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">
                <div className="flex-fill pt-1">
                    <Row>
                        <Col lg className="order-lg-last">Steps</Col>
                        <Col lg={7}>
                            <Modal.Title as="h4" className="fw-bold">
                                Account Setup
                            </Modal.Title>
                            <p className="small">Fill the below form to create your account then you will be redirected to file a claim.</p>
                        </Col>
                    </Row>
                </div>
            </Modal.Header>
            <Modal.Body className="text-break d-flex flex-column small pt-0">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="mb-3 flex-wrap"
                >
                    <h5 className="custom-font-size-18 mb-0 fw-bold">National ID Verification</h5>
                    <AppTooltip
                        title="National ID Verification Tooltip Data"
                    >
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 border-0 link-dark"
                        >
                            <FiInfo size={22} />
                        </Button>
                    </AppTooltip>
                </Stack>
                Hi Content

            </Modal.Body>
        </React.Fragment>
    );
};

export default AccountSetupModal;