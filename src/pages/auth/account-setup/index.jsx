import React, { useState } from "react";
import { Button, Col, Modal, Row, Stack, Tab } from "react-bootstrap";
import StepsProgress from "../../../components/stepProgress/stepProgress";
import IdVerificationTab from "./idVerificationTab";
import PersonalInfoTab from "./personalInfoTab";
import { fingerPrintValidate } from "../../../redux/slice/authSlice";
import { useDispatch } from "react-redux";

const AccountSetupModal = ({ handleClose, handleFormSubmit }) => {

    const dispatch = useDispatch()

    const [activeTab, setActiveTab] = useState(0);
    const [isIdVerificationSubmitted, setIsIdVerificationSubmitted] = useState(false);
    const [isPersonalInfoSubmitted, setIsPersonalInfoSubmitted] = useState(false);

    const [newAccountData, setNewAccountData] = useState({})

    // Handle ID Verification Submit
    const handleIdVerificationSubmit = async (values, actions) => {
        const result = await dispatch(fingerPrintValidate({ identificacion: values?.nationalID, individualDactilar: values?.fingerprintCode }));
        if (fingerPrintValidate.fulfilled.match(result)) {
            setIsIdVerificationSubmitted(true);
        }
        actions.setSubmitting(false);
    };

    // Handle Personal Info Submit
    const handlePersonalInfoSubmit = (values, actions) => {
        console.log('Personal Info values', values)
        // setIsPersonalInfoSubmitted(true);
        // actions.setSubmitting(false);
    };

    // Handle Finish Button Click
    const handleFinishClick = () => {
        setIsIdVerificationSubmitted(false);
        setIsPersonalInfoSubmitted(false);
        handleFormSubmit(newAccountData)
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
            content: <IdVerificationTab setNewAccountData={setNewAccountData} isSubmitted={setIsIdVerificationSubmitted} />,
        },
        {
            eventKey: 1,
            content: <PersonalInfoTab setNewAccountData={setNewAccountData} isSubmitted={setIsPersonalInfoSubmitted} />,
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
            <Modal.Body className="text-break d-flex flex-column small pt-0 px-0">
                <Tab.Container
                    id="theme-steps-tabs"
                    activeKey={activeTab}
                >
                    <Tab.Content>
                        {tabData.map((tab) => (
                            <Tab.Pane key={tab.eventKey} eventKey={tab.eventKey}>
                                <div className="px-4">{tab.content}</div>
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