import React, { useState } from "react";
import { Button, Col, Modal, Row, Stack, Tab } from "react-bootstrap";
import StepsProgress from "../../../components/stepProgress/stepProgress";
import IdVerificationTab from "./idVerificationTab";
import PersonalInfoTab from "./personalInfoTab";

const AccountSetupModal = ({ handleClose, handleFormSubmit }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isIdVerificationSubmitted, setIsIdVerificationSubmitted] = useState(false);
    const [isPersonalInfoSubmitted, setIsPersonalInfoSubmitted] = useState(false);

    // Handle ID Verification Submit
    const handleIdVerificationSubmit = (values, actions) => {
        console.log('ID Verification values', values)
        setIsIdVerificationSubmitted(true);
        actions.setSubmitting(false);
    };

    // Handle Personal Info Submit
    const handlePersonalInfoSubmit = (values, actions) => {
        console.log('Personal Info values', values)
        setIsPersonalInfoSubmitted(true);
        actions.setSubmitting(false);
    };

    // Handle Finish Button Click
    const handleFinishClick = () => {
        setIsIdVerificationSubmitted(false);
        setIsPersonalInfoSubmitted(false);
        handleFormSubmit()
    };

    //Steps Data
    const stepData = [
        {
            id: 1,
            stepTitle: <>ID<br />Verification</>,
            stepCurrent: activeTab === 0,
            stepCompleted: activeTab === 1,
            stepClickHandler: () => setActiveTab(0),
        },
        {
            id: 2,
            stepTitle: <>Personal &amp;<br />Login Info</>,
            stepCurrent: activeTab === 1,
            stepCompleted: isPersonalInfoSubmitted,
            stepClickHandler: () => setActiveTab(1),
            disabled: !isIdVerificationSubmitted,
        }
    ]

    //Tabs Data
    const tabData = [
        {
            eventKey: 0,
            content: <IdVerificationTab handleFormSubmit={handleIdVerificationSubmit} />,
        },
        {
            eventKey: 1,
            content: <PersonalInfoTab handleFormSubmit={handlePersonalInfoSubmit} />,
        },
    ];

    return (
        <React.Fragment>
            <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">
                <div className="flex-fill pt-1">
                    <Row className="g-0">
                        <Col sm lg={7}>
                            <Modal.Title as="h4" className="fw-bold">
                                Account Setup
                            </Modal.Title>
                            <p className="small">Fill the below form to create your account then you will be redirected to file a claim.</p>
                        </Col>
                        <Col sm="auto" className="ms-auto mb-2 mb-sm-0">
                            <div className="text-end">
                                <StepsProgress stepData={stepData} />
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal.Header>
            <Modal.Body className="text-break d-flex flex-column small pt-0">
                <Tab.Container
                    id="theme-steps-tabs"
                    activeKey={activeTab}
                >
                    <Tab.Content>
                        {tabData.map((tab) => (
                            <Tab.Pane key={tab.eventKey} eventKey={tab.eventKey}>
                                {tab.content}
                            </Tab.Pane>
                        ))}
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
            <Modal.Footer className="border-top">
                <Stack direction="horizontal" gap={3} className="flex-wrap flex-fill">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setActiveTab(0)
                            if (activeTab === 0) {
                                handleClose()
                            }
                        }}
                        className="custom-min-width-100 me-auto"
                    >
                        <span className="me-1">&lt;</span>Back
                    </Button>
                    <Button
                        type="button"
                        variant="warning"
                        className="custom-min-width-100"
                        onClick={() => {
                            setActiveTab(1)
                            if (isPersonalInfoSubmitted) {
                                handleFinishClick()
                            }
                        }}
                        disabled={activeTab === 1 && !isPersonalInfoSubmitted || !isIdVerificationSubmitted}
                    >
                        {activeTab === 1 ? 'Finish' : <>Next<span className="ms-1">&gt;</span></>}
                    </Button>
                </Stack>
            </Modal.Footer>
        </React.Fragment>
    );
};

export default AccountSetupModal;