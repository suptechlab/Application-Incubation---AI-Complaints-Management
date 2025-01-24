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
import { createNewClaimApi } from "../../../services/claimcreate.services";
import toast from "react-hot-toast";

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

    
    // Handle Close Reset
    const handleCloseReset = () => {
        // Close the modal
        // A timeout to reset the state after a brief delay
        setTimeout(() => {
            setIsBasicInfoSubmitted(false);
            setIsOtherInfoSubmitted(false);
        }, 500);
    }


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
      
        createNewClaimApi(formData).then((response)=>{

            setFileClaimResponse(response?.data)
            if (response?.data?.foundDuplicate === true) {
                setFileAlertModalShow(true)
            } else {
                setFileSuccesModalShow(true)
            }
            actions.setSubmitting(false);
            handleCloseReset()


        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
              toast.error(error?.response?.data?.errorDescription);
            } else {
              toast.error(error?.message ?? t("FILE A CLAIM ERROR!"));
            }
           
          }).finally(() => {
            // Ensure the loading toast is dismissed
            actions.setSubmitting(false)
            setIsLoading(false);
          });


    };

    // HANDLE FILE DUPLICATE CLAIM
    const handleFileDuplicateClaim = async () => {
        // let formData = { ...fileClaimValues, checkDuplicate: false }

        let combinedData = { ...fileClaimValues, checkDuplicate: false };
      
        setFileClaimValues((prev) => ({ ...prev, ...combinedData }))

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
      
        createNewClaimApi(formData).then((response)=>{
            setFileClaimResponse(response?.data)
            setFileAlertModalShow(false)
            setFileSuccesModalShow(true)
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
              toast.error(error?.response?.data?.errorDescription);
            } else {
              toast.error(error?.message ?? t("FILE A CLAIM ERROR!"));
            }
           
          }).finally(() => {
            // Ensure the loading toast is dismissed
            setIsLoading(false);
          });
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
            content: <ClaimDetailsTab backButtonClickHandler={backButtonClaimDetailsClickHandler} handleFormSubmit={handleClaimDetailsSubmit} setIsLoading={setIsLoading} userEmail = {fileClaimValues?.email}/>,
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
                handleClose={() => {setFileSuccesModalShow(false);navigate('/tickets')}}
                handleFormSubmit={handleFileSuccesClick}
                fileClaimData={fileClaimResponse}
            />
        </React.Fragment>
    );
};