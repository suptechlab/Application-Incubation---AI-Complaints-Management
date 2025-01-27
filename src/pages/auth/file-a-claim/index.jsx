import React, { useState } from "react";
import { Col, Modal, Row, Tab } from "react-bootstrap";
import StepsProgress from "../../../components/stepProgress/stepProgress";
import BasicInfoTab from "./basicInfoTab";
import ClaimDetailsTab from "./claimDetailsTab";
import FileAlertModal from "./file-alert";
import FileSuccesModal from "./file-success";
import OtherInfoTab from "./otherInfoTab";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { fileClaimForm } from "../../../redux/slice/fileClaimSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";

const FileClaimModal = ({ handleShow, handleClose }) => {

    const { t } = useTranslation()

    const [activeTab, setActiveTab] = useState(0);
    const [isBasicInfoSubmitted, setIsBasicInfoSubmitted] = useState(false);
    const [isOtherInfoSubmitted, setIsOtherInfoSubmitted] = useState(false);
    const [fileSuccesModalShow, setFileSuccesModalShow] = useState(false);
    const [fileAlertModalShow, setFileAlertModalShow] = useState(false);

    const [isLoading, setIsLoading] = useState(false)

    const [fileClaimResponse, setFileClaimResponse] = useState({})

    const navigate = useNavigate()


    const dispatch = useDispatch()


    const [fileClaimValues, setFileClaimValues] = useState({})


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
        setFileClaimValues((prev) => ({ ...prev, ...values }))
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
        setActiveTab(2)
        setFileClaimValues((prev) => ({ ...prev, ...values }))
        setIsOtherInfoSubmitted(true);
        actions.setSubmitting(false);
    };

    // Handle Claim Details Back Button
    const backButtonClaimDetailsClickHandler = () => {
        setActiveTab(1)
    };

    // HANDLE CLAIM DETAILS  AND FORM WILL BE FINISH HERE
    const handleClaimDetailsSubmit = async (values, actions) => {
        let combinedData = { ...fileClaimValues, ...values };
        combinedData.checkDuplicate = true;
        setFileClaimValues((prev) => ({ ...prev, ...values }))

        const formData = new FormData();

        Object.entries(combinedData).forEach(([key, value]) => {
            if (key === "files") {
                
                value.forEach((file, index) => {
                    formData.append(`attachments[${index}]`, file);
                });
            } else {
                
                formData.append(key, value);
            }
        });

        // Dispatch the FormData
        setIsLoading(true);
        const result = await dispatch(fileClaimForm(formData));
        setIsLoading(false);

        if (fileClaimForm.fulfilled.match(result)) {
            setFileClaimResponse(result?.payload?.data);

            if (result?.payload?.data?.foundDuplicate) {
                setFileAlertModalShow(true);
            } else {
                setFileSuccesModalShow(true);
            }

            actions.setSubmitting(false);
            handleCloseReset();
        } else {
            console.error("Verification error:", result.error.message);
            actions.setSubmitting(false);
        }
    };


    // HANDLE FILE DUPLICATE CLAIM
    const handleFileDuplicateClaim = async () => {
        setIsLoading(true);
        let combinedData = { ...fileClaimValues, checkDuplicate: false };

        const formData = new FormData();

        Object.entries(combinedData).forEach(([key, value]) => {
            if (key === "files") {
                
                value.forEach((file, index) => {
                    formData.append(`attachments[${index}]`, file);
                });
            } else {
                
                formData.append(key, value);
            }
        });

        // Dispatch the FormData
      
        const result = await dispatch(fileClaimForm(formData));
        setIsLoading(false);
        if (fileClaimForm.fulfilled.match(result)) {
            setFileClaimResponse(result?.payload?.data)
            setFileAlertModalShow(false)
            setFileSuccesModalShow(true)
            handleCloseReset()
        } else {
            console.error('Verification error:', result.error.message);
        }
    }
    // Handle File Alert Click
    const handleFileAlertClick = () => {
        setFileAlertModalShow(false)
        setFileSuccesModalShow(true)
    };
    // Handle File Succes Click
    const handleFileSuccesClick = () => {
        setFileSuccesModalShow(false)
        setActiveTab(0)
        navigate('/my-account')
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
            content: <BasicInfoTab handleFormSubmit={handleBasicInfoSubmit} setIsLoading={setIsLoading} />,
        },
        {
            eventKey: 1,
            content: <OtherInfoTab backButtonClickHandler={backButtonOtherInfoClickHandler} handleFormSubmit={handleOtherInfoSubmit} />,
        },
        {
            eventKey: 2,
            content: <ClaimDetailsTab backButtonClickHandler={backButtonClaimDetailsClickHandler} handleFormSubmit={handleClaimDetailsSubmit} setIsLoading={setIsLoading} />,
        },
    ];


    const handleModalClose = () => {
        handleClose()
        setActiveTab(0)
        setIsBasicInfoSubmitted(false)
    }
    return (
        <React.Fragment>
            <Loader isLoading={isLoading} />
            <Modal
                show={handleShow}
                onHide={handleModalClose}
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
            {/* FILE A CLAIM ALERT MODAL IF DUPLICATE FOUND */}
            <FileAlertModal
                handleShow={fileAlertModalShow}
                handleClose={() => setFileAlertModalShow(false)}
                handleFormSubmit={handleFileDuplicateClaim}
                fileClaimData={fileClaimResponse}
            />

            {/* FILE A CLAIM SUCCESS */}
            <FileSuccesModal
                handleShow={fileSuccesModalShow}
                handleClose={() => setFileSuccesModalShow(false)}
                handleFormSubmit={handleFileSuccesClick}
                fileClaimData={fileClaimResponse}
            />
        </React.Fragment>
    );
};

export default FileClaimModal;