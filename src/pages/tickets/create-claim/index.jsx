import React, { useState } from "react";
import { Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import BasicInfoTab from "./basicInfoTab";
import ClaimDetailsTab from "./claimDetailsTab";
import FileAlertModal from "./file-alert";
import FileSuccesModal from "./file-success";
import PageHeader from "./header";
import OtherInfoTab from "./otherInfoTab";

export default function CreateClaim() {

    const { t } = useTranslation()

    const [activeTab, setActiveTab] = useState(0);
    const [isBasicInfoSubmitted, setIsBasicInfoSubmitted] = useState(false);
    const [isOtherInfoSubmitted, setIsOtherInfoSubmitted] = useState(false);
    const [fileSuccesModalShow, setFileSuccesModalShow] = useState(false);
    const [fileAlertModalShow, setFileAlertModalShow] = useState(false);

    const [isLoading, setIsLoading] = useState(false)

    const [fileClaimResponse, setFileClaimResponse] = useState({})

    const navigate = useNavigate()



    const [fileClaimValues, setFileClaimValues] = useState({})


    // Handle Basic Info Submit
    const handleBasicInfoSubmit = (values, actions) => {
        console.log('step 1 completed')
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

        let formData = { ...fileClaimValues, ...values }
        formData.checkDuplicate = true
        setFileClaimValues((prev) => ({ ...prev, ...values }))

        // const result = await dispatch(fileClaimForm(formData));
        // if (fileClaimForm.fulfilled.match(result)) {
        //     console.log({ result: result?.payload?.data })
        //     setFileClaimResponse(result?.payload?.data)
        //     if (result?.payload?.data?.foundDuplicate === true) {
        //         setFileAlertModalShow(true)
        //     } else {
        //         setFileSuccesModalShow(true)
        //     }
        //     actions.setSubmitting(false);
        //     handleCloseReset()
        // } else {
        //     console.error('Verification error:', result.error.message);
        //     actions.setSubmitting(false)
        // }
    };

    // HANDLE FILE DUPLICATE CLAIM
    const handleFileDuplicateClaim = async () => {
        // let formData = { ...fileClaimValues, checkDuplicate: false }
        // const result = await dispatch(fileClaimForm(formData));
        // if (fileClaimForm.fulfilled.match(result)) {
        //     setFileClaimResponse(result?.payload?.data)
        //     setFileAlertModalShow(false)
        //     setFileSuccesModalShow(true)
        //     handleCloseReset()
        // } else {
        //     console.error('Verification error:', result.error.message);
        // }
    }
    // Handle File Alert Click
    // const handleFileAlertClick = () => {
    //     setFileAlertModalShow(false)
    //     setFileSuccesModalShow(true)
    // };
    // Handle File Succes Click
    const handleFileSuccesClick = () => {
        setFileSuccesModalShow(false);
        setActiveTab(0);
        navigate('/tickets');
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
            content: <OtherInfoTab backButtonClickHandler={backButtonOtherInfoClickHandler} handleFormSubmit={handleOtherInfoSubmit} setIsLoading={setIsLoading} />,
        },
        {
            eventKey: 2,
            content: <ClaimDetailsTab backButtonClickHandler={backButtonClaimDetailsClickHandler} handleFormSubmit={handleClaimDetailsSubmit} setIsLoading={setIsLoading} />,
        },
    ];
    return (
        <React.Fragment>
            <Loader isLoading={isLoading} />
            <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                <PageHeader title={t("CREATE_A_CLAIM")} stepData={stepData} />
                <Tab.Container
                    id="file-clainm-steps-tabs"
                    activeKey={activeTab}
                >
                    <Tab.Content
                        className='flex-grow-1'
                    >
                        {tabData.map((tab) => (
                            <Tab.Pane className="h-100" key={tab.eventKey} eventKey={tab.eventKey}>
                                {tab.content}
                            </Tab.Pane>
                        ))}
                    </Tab.Content>
                </Tab.Container>
            </div>

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