import React, { useState } from "react";
import { Col, Modal, Row, Tab } from "react-bootstrap";
import StepsProgress from "../../../components/stepProgress/stepProgress";
import BasicInfoTab from "./basicInfoTab";
import ClaimDetailsTab from "./claimDetailsTab";
import FileAlertModal from "./file-alert";
import FileSuccesModal from "./file-success";
import OtherInfoTab from "./otherInfoTab";
import { useTranslation } from "react-i18next";

const FileClaimModal = ({ handleShow, handleClose }) => {

    const { t } = useTranslation()

    const [activeTab, setActiveTab] = useState(0);
    const [isBasicInfoSubmitted, setIsBasicInfoSubmitted] = useState(false);
    const [isOtherInfoSubmitted, setIsOtherInfoSubmitted] = useState(false);
    const [fileSuccesModalShow, setFileSuccesModalShow] = useState(false);
    const [fileAlertModalShow, setFileAlertModalShow] = useState(false);


    // Handle Close Reset
    const handleCloseReset = () => {
        // Close the modal
        handleClose();

        // A timeout to reset the state after a brief delay
        setTimeout(() => {
            setIsBasicInfoSubmitted(false);
            setIsOtherInfoSubmitted(false);
        }, 500);
    }

    // Handle Basic Info Submit
    const handleBasicInfoSubmit = (values, actions) => {
        console.log('Basic Info values', values)
        setActiveTab(1)
        setIsBasicInfoSubmitted(true);
        actions.setSubmitting(false);
    };

    // Handle Other Info Back Button
    const backButtonOtherInfoClickHandler = () => {
        setActiveTab(0)
    };

    // Handle Other Info Submit
    const handleOtherInfoSubmit = (values, actions) => {
        console.log('Other Info values', values)
        setActiveTab(2)
        setIsOtherInfoSubmitted(true);
        actions.setSubmitting(false);
    };

    // Handle Claim Details Back Button
    const backButtonClaimDetailsClickHandler = () => {
        setActiveTab(1)
    };

    // Handle Claim Details Submit
    const handleClaimDetailsSubmit = (values, actions) => {
        console.log('Claim Details values', values)
        actions.setSubmitting(false);
        handleCloseReset()
        setFileAlertModalShow(true)
    };

    // Handle File Alert Click
    const handleFileAlertClick = () => {
        console.log('handleFileAlertClick')
        setFileAlertModalShow(false)
        setFileSuccesModalShow(true)
    };

    // Handle File Succes Click
    const handleFileSuccesClick = () => {
        console.log('handleFileSuccesClick')
        setFileSuccesModalShow(false)
    };

    //Steps Data
    const stepData = [
        {
            id: 1,
            stepTitle: t("BASIC_INFO"),
            stepCurrent: activeTab === 0,
            stepCompleted: isBasicInfoSubmitted,
            stepClickHandler: () => setActiveTab(0),
        },
        {
            id: 2,
            stepTitle: t("OTHER_INFO"),
            stepCurrent: activeTab === 1,
            stepCompleted: isOtherInfoSubmitted,
            stepClickHandler: () => setActiveTab(1),
            disabled: !isBasicInfoSubmitted,
        },
        {
            id: 3,
            stepTitle: t("CLAIM_DETAILS"),
            stepCurrent: activeTab === 2,
            stepCompleted: activeTab === 3,
            stepClickHandler: () => setActiveTab(2),
            disabled: !isOtherInfoSubmitted,
        }
    ]


    //Tabs Data
    const tabData = [
        {
            eventKey: 0,
            content: <BasicInfoTab handleFormSubmit={handleBasicInfoSubmit} />,
        },
        {
            eventKey: 1,
            content: <OtherInfoTab backButtonClickHandler={backButtonOtherInfoClickHandler} handleFormSubmit={handleOtherInfoSubmit} />,
        },
        {
            eventKey: 2,
            content: <ClaimDetailsTab backButtonClickHandler={backButtonClaimDetailsClickHandler} handleFormSubmit={handleClaimDetailsSubmit} />,
        },
    ];

    return (
        <React.Fragment>
            <Modal
                show={handleShow}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered={true}
                scrollable={true}
                size="lg"
                className="theme-modal scrollable-disabled-below-600"
                enforceFocus={false}
            >
                <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">
                    <div className="flex-fill pt-1">
                        <Row className="g-0">
                            <Col lg={6}>
                                <Modal.Title as="h4" className="fw-bold">
                                    {t("FILE_A_CLAIM")}
                                </Modal.Title>
                                <p className="small">{t("CLAIM_FORM_DESCRIPTION")}</p>
                            </Col>
                            <Col lg="auto" className="ms-auto mb-2 mb-sm-0">
                                <div className="text-end">
                                    <StepsProgress stepData={stepData} />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Modal.Header>

                <Tab.Container
                    id="file-clainm-steps-tabs"
                    activeKey={activeTab}
                >
                    <Tab.Content >
                        {tabData.map((tab) => (
                            <Tab.Pane key={tab.eventKey} eventKey={tab.eventKey}>
                                {tab.content}
                            </Tab.Pane>
                        ))}
                    </Tab.Content>
                </Tab.Container>
            </Modal>

            {/* File a Claim Alert Modal */}
            <FileAlertModal
                handleShow={fileAlertModalShow}
                handleClose={() => setFileAlertModalShow(false)}
                handleFormSubmit={handleFileAlertClick}
            />

            {/* File a Claim Success Modal */}
            <FileSuccesModal
                handleShow={fileSuccesModalShow}
                handleClose={() => setFileSuccesModalShow(false)}
                handleFormSubmit={handleFileSuccesClick}
            />
        </React.Fragment>
    );
};

export default FileClaimModal;