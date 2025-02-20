import React, { useEffect, useRef, useState } from 'react';
import { Button, Offcanvas, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdAttachFile, MdKeyboardBackspace, MdPerson } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import CommonFormikComponent from '../../../components/CommonFormikComponent';
import FormInputBox from '../../../components/FormInput';
import SvgIcons from '../../../components/SVGIcons';
import AppTooltip from '../../../components/tooltip';
import { loginAndFetchAccountInfo } from "../../../redux/slice/authSlice";
import { chatbotFileUpload, sendQuery } from '../../../redux/slice/helpDeskSlice';
import { ChatBotFormSchema } from '../validations';
import ReactSelect from '../../../components/ReactSelect';
const ChatBotForm = () => {
    const { t } = useTranslation()
    const chatEndRef = useRef(null);
    const [isLoading, setLoading] = useState(false)



    const { token } = useSelector(state => state?.authSlice)


    const [uploadedFiles, setUploadedFiles] = useState([])


    const [isFileUpload, setIsFileUpload] = useState(false)

    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        // Trigger the file input click event
        fileInputRef.current.click();
    };

    const dispatch = useDispatch()
    // Initial Values
    const initialValues = {
        message: '',
        suggestion: ''
    };

    const { queryError } = useSelector((state) => state.helpDeskSlice);
    const [chatEnded, setChatEnded] = useState(false)

    const [botSuggestion, setBotSuggestions] = useState([])
    const [chatData, setChatData] = useState([{
        id: 1,
        message: <>{t("CHATBOT_INITIAL_TEXT")}</>,
        userMode: false,
        botViewMode: true,
        botReview: [],
        botSuggestion: [],
        error: null
    },])

    const [senderId, setSenderId] = useState("")

    //Dummy Chat 
    const dummy_chat = [
        {
            id: 8,
            message: <>How may i help you ? Please choose from an option below.</>,
            userMode: false,
            botViewMode: true,
            botReview: [],
            botSuggestion: [
                {
                    id: 1,
                    suggestion: "File a Claim?",
                    positive: false,
                },
                {
                    id: 2,
                    suggestion: "I need to Inquire something",
                    positive: false,
                },
            ]
        },
        {
            id: 9,
            message: <>Thanks! as you choose inquiry please select the <span className='fw-bold'>Type of Inquiry</span> you want to discuss from:</>,
            userMode: false,
            botViewMode: true,
            botReview: [],
            botSuggestion: [
                {
                    id: 1,
                    suggestion: "Corporate Governance",
                    positive: false,
                },
                {
                    id: 2,
                    suggestion: "Non-Profit Organizations",
                    positive: false,
                },
                {
                    id: 3,
                    suggestion: "Consumer Protection",
                    positive: false,
                },
                {
                    id: 4,
                    suggestion: "Inter consultation",
                    positive: false,
                },
                {
                    id: 5,
                    suggestion: "Self-Management",
                    positive: false,
                },
                {
                    id: 6,
                    suggestion: "Non-Competition",
                    positive: false,
                },
                {
                    id: 7,
                    suggestion: "Auxiliary Services",
                    positive: false,
                },
                {
                    id: 8,
                    suggestion: "Service Points",
                    positive: false,
                },
                {
                    id: 9,
                    suggestion: "Authorization of Financial Services",
                    positive: false,
                },
                {
                    id: 10,
                    suggestion: "Reform of SFPS Statutes",
                    positive: false,
                }
            ]
        },
        {
            id: 10,
            message: <>Ok! so you need to inquire about <span className='fw-bold'>Consumer Protection?</span> So can you please choose the sub type of your inquiry ?</>,
            userMode: false,
            botViewMode: true,
            botReview: [],
            botSuggestion: [
                {
                    id: 1,
                    suggestion: "Unauthorized Charges",
                    positive: false,
                },
                {
                    id: 2,
                    suggestion: "Policies",
                    positive: false,
                },
                {
                    id: 3,
                    suggestion: "Debt Reduction Insurance",
                    positive: false,
                },
                {
                    id: 4,
                    suggestion: "Transparency and Disclosure",
                    positive: false,
                },
                {
                    id: 5,
                    suggestion: "Information Citing the LOTAIP",
                    positive: false,
                },
                {
                    id: 6,
                    suggestion: "Fair and Responsible Treatment",
                    positive: false,
                },
                {
                    id: 7,
                    suggestion: "Data Security and Protection Risk",
                    positive: false,
                },
                {
                    id: 8,
                    suggestion: "Credit Data Registry",
                    positive: false,
                },
            ]
        },
        {
            id: 1,
            message: `Ok! so as you want to know about Credit Data Registry. Tell me what can i help you in that ?`,
            userMode: false,
            botViewMode: false,
            botReview: [],
        },
        {
            id: 2,
            message: `In eget efficitu sem facilisis veh vestibulum, enim elit volutpat velit, eu faucibus erat metus at diam. I`,
            userMode: true,
            botViewMode: false,
            botReview: [],
        },
        {
            id: 3,
            message: `Cras aliquam id orci pharetra malesa. Aliquamrt nec mattis augue, art aliqu quam. In eget efficitu sem facilisis veh vestibulum, enim elit volutpat velit, eu faucibus erat metus at diam. Integer vitae nisl et le eleifend aliquam quam. In eget efficitur.`,
            userMode: false,
            botViewMode: false,
            botReview: [],
        },
        {
            id: 4,
            message: `Hi John, we hope your recent inquiry was resolved!Could you please confirm if you're satisfied with the resolution of your inquiry?`,
            userMode: false,
            botViewMode: true,
            botReview: [
                {
                    id: 1,
                    suggestion: "Yes, I'm satisfied",
                    positive: true,
                },
                {
                    id: 2,
                    suggestion: "No, I'm not satisfied",
                    positive: false,
                },
            ],
        },
        {
            id: 5,
            message: `We're glad to hear that! Would you mind taking a moment to fill out a quick Satisfaction Survey? It will help us improve our services.`,
            userMode: false,
            botViewMode: true,
            botReview: [
                {
                    id: 1,
                    suggestion: "Sure, I'll fill it out",
                    positive: true,
                },
                {
                    id: 2,
                    suggestion: "No, thanks",
                    positive: false,
                },
            ],
        },
        {
            id: 6,
            message: `Thank you for taking the time to complete the survey. Your feedback is valuable to us!`,
            userMode: false,
            botViewMode: true,
            botReview: [],
        },
        {
            id: 7,
            message: `If you need any further assistance, feel free to reach out again. Have a great day!`,
            userMode: false,
            botViewMode: true,
            botReview: [],
        },
    ]
    // Action Button Handler
    const actionButtonHandler = async (msgData) => {
        setLoading(true);
        try {
            const messageData = { ...msgData, metadata: {} }

            if (token) {
                messageData.metadata.token = token
            }
            // Send the message to the API
            const result = await dispatch(sendQuery(messageData));
            if (sendQuery.fulfilled.match(result)) {
                setChatResponse(result.payload); // Handle successful response
            } else {
                setChatError(); // Set specific error message if needed
            }
        } catch (error) {
            setChatError(); // Handle unexpected errors
            console.error("Error in actionButtonHandler:", error);
        } finally {
            setLoading(false); // Ensure loading is turned off
        }
    };

    // CALL SEND QUERY FUNCTION
    const handleSendQuery = async (msg) => {
        if (msg) {
            setLoading(true);

            // Prepare the message data
            const msgData = {
                message: msg?.message || msg, // If `msg` is an object, use `msg.message`, otherwise use `msg` directly
                metadata: {}
            };
            // Add metadata if it exists
            if (msg?.metadata) {
                msgData.metadata = msg.metadata;
            }

            if (token) {
                msgData.metadata.token = token
            }

            // Add sender ID if available
            if (senderId) {
                msgData.sender = senderId;
            }

            try {
                // Dispatch the API query
                const result = await dispatch(sendQuery(msgData));
                if (sendQuery.fulfilled.match(result)) {
                    setChatResponse(result.payload); // Set chat response on success
                } else {
                    setChatError(); // Handle API failure
                }
            } catch (error) {
                console.error("Error sending query:", error);
                setChatError(); // Handle unexpected errors
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        actions.setSubmitting(true); // Set submitting state
        // setLoading(true)
        try {
            if (values?.message && values?.message !== "") {
                // Prepare user message
                const userMessage = {
                    id: chatData.length + 1,
                    message: values.message,
                    userMode: true,
                    botViewMode: false,
                    botReview: [], // buttons
                    botSuggestion: [],
                };

                // Update chat data with the new user message
                setChatData([...chatData, userMessage]);
                actions.resetForm(); // Reset the form


                handleSendQuery({ message: values?.message })
                // Proceed only if the message is valid
            }


        } catch (error) {
            setChatError(); // Handle unexpected errors
            console.error("Error in handleSubmit:", error);
        } finally {
            // setLoading(false)
            actions.setSubmitting(false); // Ensure submitting is turned off
        }
    };

    // SET CHAT RESPONSE DATA
    const setChatResponse = (chatResponse) => {
        setChatData((prevChatData) => {
            const newChatData = chatResponse?.map((item, index) => {
                const hasButtons = item.buttons && item.buttons.length > 0;

                if (item?.custom?.id_token) {
                    setIsFileUpload(false);
                    dispatch(loginAndFetchAccountInfo({ id_token: item?.custom?.id_token }));
                    return null;
                } else if (item?.custom?.file_upload_required === true) {
                    setIsFileUpload(true);
                    return null;
                } else if (item?.custom?.redirect) {
                    window.open(item.custom.redirect, "_blank");
                    return null;
                } else {
                    setIsFileUpload(false);

                    let botReview = [];
                    let botSuggestion = [];

                    if (hasButtons) {
                        if (item.buttons.length > 5) {
                            // Store dropdown options in botSuggestion
                            botSuggestion = item.buttons.map((btn, idx) => ({
                                id: idx + 1,
                                label: btn.title,
                                value: btn.payload,
                            }));

                        } else {
                            // Store normal buttons in botReview
                            botReview = item.buttons.map((btn, idx) => ({
                                id: idx + 1,
                                suggestion: btn.title,
                                positive: item.buttons.length === 2 && idx === 0,
                                payload: btn.payload,
                            }));
                        }
                    }
                    setBotSuggestions(botSuggestion)

                    // Replace **bold text** with <strong> tags
                    let formattedMessage = item.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

                    // Convert URLs to anchor tags
                    formattedMessage = formattedMessage.replace(
                        /(https?:\/\/[^\s]+)/g,
                        '<a href="$1" target="_blank">$1</a>'
                    );

                 

                    return {
                        id: prevChatData.length + index + 1,
                        message: <span dangerouslySetInnerHTML={{ __html: formattedMessage }} />,
                        userMode: false,
                        botViewMode: true,
                        recipient_id: item.recipient_id,
                        botReview, // Buttons (up to 5)
                        // botSuggestion, // Dropdown options (if more than 5)
                        hasButtons: hasButtons,
                        hasDropdown: botSuggestion.length > 0, // Flag for dropdown
                    };
                }
            }).filter((item) => item !== null); // Remove null values

            return [...prevChatData, ...newChatData];
        });

        const lastRecipientId = chatResponse.at(-1)?.recipient_id;
        if (lastRecipientId) setSenderId(lastRecipientId);
    };


    const setChatError = () => {
        setChatData((prevChatData) => {
            const lastError = prevChatData.at(-1)?.error;

            // Avoid adding duplicate error messages
            if (lastError === queryError) return prevChatData;

            const userMessage = {
                id: prevChatData.length + 1, // Use prevChatData length for unique ID
                message: '',
                userMode: false,
                botViewMode: false,
                botReview: [],
                botSuggestion: [],
                error: 'Something went wrong! try again later',
            };

            return [...prevChatData, userMessage];
        });
    }

    // Scroll to the bottom of the messages container when new messages are added
    useEffect(() => {
        if (chatEndRef?.current) {
            chatEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatData]);

    const handleFileChange = (event, setFieldValue) => {
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
        const MAX_FILE_COUNT = 3; // Maximum number of files allowed

        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files);

            // Filter files based on size
            const validFiles = selectedFiles.filter((file) => {
                if (file.size > MAX_FILE_SIZE) {
                    toast.error(`${file.name}` + ' ' + t('TOO_LARGE_FILE'));
                    return false;
                }
                return true;
            });

            if (validFiles.length > 0) {
                setUploadedFiles((prevFiles) => {
                    const totalFiles = prevFiles.length + validFiles.length;

                    if (totalFiles > MAX_FILE_COUNT) {
                        toast.error(t('TOO_MANY_FILES'));
                        return prevFiles;
                    } else {

                        const formData = new FormData()

                        validFiles?.forEach((validFile, index) => {
                            formData.append(`attachments[${index}]`, validFile)
                        })
                        setLoading(true)

                        dispatch(chatbotFileUpload(formData)).then((result) => {

                            if (chatbotFileUpload.fulfilled.match(result)) {

                                const userMessage = {
                                    id: chatData.length + 1,
                                    message: validFiles.map(file => file.name).join(', '), // Join file names as the message,
                                    userMode: true,
                                    botViewMode: false,
                                    botReview: [], // buttons
                                    botSuggestion: [],
                                };

                                // Update chat data with the new user message
                                setChatData([...chatData, userMessage]);

                                const filesId = result?.payload.toString();

                                const metadata = {};

                                // Check if `filesId` is a single ID or a comma-separated string
                                if (filesId.includes(',')) {
                                    // Split and process multiple IDs
                                    const ids = filesId.split(',');
                                    ids.forEach((id, index) => {
                                        metadata[`attachmentsIds[${index}]`] = id;
                                    });
                                } else {
                                    // Process single ID
                                    metadata['attachmentsIds[0]'] = filesId;
                                }

                                setFieldValue('attachments', '')
                                handleSendQuery({ message: 'Quiero subir un archivo', metadata })

                                // SEND RESULT IN SEND QUERY
                            } else {
                                console.error("Verification error:", result.error.message);
                            }
                        })
                            .catch(error => {
                                console.error("Error during file claim submission:", error);
                            }).finally(() => {
                                setLoading(false)
                            });
                        return [...prevFiles, ...validFiles];
                    }
                });
            }
        }
    };

    const handleSuggestionSelect = (value, selectedLabel, setFieldValue) => {

        setLoading(true)
        try {
            // Prepare user message
            const userMessage = {
                id: chatData.length + 1,
                message: selectedLabel,
                userMode: true,
                botViewMode: false,
                botReview: [], // buttons
                botSuggestion: [],
            };



            // Update chat data with the new user message
            setChatData([...chatData, userMessage]);

            // Proceed only if the message is valid

            if (value) {
                handleSendQuery({ message: value })
                setFieldValue('suggestion', '')
            }
        } catch (error) {
            setChatError(); // Handle unexpected errors
            console.error("Error in handleSubmit:", error);
        } finally {
            setLoading(false)

        }
    }

    const removeFile = (indexToRemove) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };
    return (
        <React.Fragment>
            <Offcanvas.Header closeButton className='align-items-start pb-1'></Offcanvas.Header>
            <CommonFormikComponent
                validationSchema={ChatBotFormSchema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnBlur={false}  // Disable validation on blur
            // validateOnChange={false}  // Disable validation on change
            >
                {(formikProps) => (
                    <Offcanvas.Body className="text-break d-flex flex-column small p-0">
                        {/* Chatbot Body */}
                        <div className='chatbot-body d-flex flex-column flex-grow-1 overflow-auto px-3'>
                            {/* Message Repeater Section */}
                            {chatData?.map((messageItem, msgIndex) => {
                                const { message, userMode, botViewMode, botSuggestion, hasButtons, botReview, recipient_id, error } = messageItem;

                                const isLastMessage = msgIndex === chatData?.length - 1;
                                return (
                                    <div
                                        key={msgIndex + 1}
                                        className={`mb-4 ${userMode ? 'text-end' : ''}`}
                                    >
                                        <Stack
                                            direction="horizontal"
                                            gap={2}
                                            className="align-items-start d-inline-flex mw-100"
                                        >
                                            <span
                                                className={`flex-shrink-0 align-items-center custom-height-48 custom-width-48 d-inline-flex justify-content-center rounded-pill 
                                                    ${userMode ? 'bg-body-tertiary text-body text-opacity-50 order-last' : 'bg-warning text-white'}`}
                                            >
                                                {userMode ? <MdPerson size={32} /> : SvgIcons.RobotIcon(24, 24)}
                                            </span>
                                            <div> <p className='text-danger'>{error}</p></div>
                                            <div
                                                className={`fw-medium my-auto rounded ${userMode ? 'bg-body-tertiary text-start' : 'bg-warning bg-opacity-10'} ${botViewMode ? 'bg-white' : 'p-2'}`}
                                            >

                                                {message}
                                                {hasButtons && botReview && botReview.length > 0 && (
                                                    <Stack
                                                        direction="horizontal"
                                                        gap={2}
                                                        className="flex-wrap mt-3"
                                                    >
                                                        {botReview.map((actionItem, actionIndex) => {
                                                            const { suggestion, positive, payload } = actionItem;
                                                            return (
                                                                <Button
                                                                    key={actionIndex + 1}
                                                                    type="button"
                                                                    variant={positive ? "success" : "light"}
                                                                    disabled={!isLastMessage || isLoading}
                                                                    className={`bot-tag-btns text-start border-opacity-50 border-primary fs-6 lh-sm py-2 ${positive ? "text-white" : "text-body"}`}
                                                                    onClick={(event) => actionButtonHandler({ message: payload, sender: recipient_id })}
                                                                >
                                                                    {suggestion}
                                                                </Button>
                                                            )
                                                        })}
                                                    </Stack>
                                                )}
                                            </div>
                                        </Stack>
                                        {/* {botSuggestion && botSuggestion.length > 0 && (
                                            <Stack
                                                direction="horizontal"
                                                gap={2}
                                                className="flex-wrap mt-3"
                                            >
                                                {botSuggestion.map((actionItem) => {
                                                    const { id, suggestion, positive } = actionItem;
                                                    return (
                                                        <Button
                                                            key={id}
                                                            type="button"
                                                            variant={positive ? "success" : "light"}
                                                            className={`bot-tag-btns text-start border-opacity-50 border-primary fs-6 lh-sm py-2 ${positive ? "text-white" : "text-body"}`}
                                                            onClick={() => actionButtonHandler(suggestion)}
                                                        >
                                                            {suggestion}
                                                        </Button>
                                                    )
                                                })}
                                            </Stack>
                                        )} */}
                                    </div>
                                )

                            })}

                            {/* WHEN CHAT ENDS USE THIS */}
                            {
                                chatEnded ? <Stack direction='horizontal' className='position-relative justify-content-center border-top border-2 border-opacity-10 border-black my-4'>
                                    <span className='bg-body-tertiary fs-12 fw-semibold lh-sm position-absolute px-2 py-1 start-50 text-black text-opacity-50 top-50 translate-middle z-1'>Chat Ended</span>
                                </Stack> : ''
                            }
                            <div ref={chatEndRef} />
                        </div>


                        {/* Chatbot Body Footer */}
                        <div className='chatbot-body-footer p-3'>
                            {isLoading === true ? <div className='chat-loader mb-1'></div> : ""}
                            {/* 
                            {
                                uploadedFiles && uploadedFiles?.length > 0 && 

                                uploadedFiles?.map((file)=>{
                                    return <div className='me-auto mb-2'>
                                        <Badge
                                            pill
                                            bg='info-subtle'
                                            className='text-info'
                                        >
                                            {file?.name}
                                        </Badge>
                                    </div> 
                                })
                                   
                            } */}

                            {
                                isFileUpload ? <div className="">
                                    <AppTooltip title="Add Attachments">
                                        <Button
                                            type="button" // Ensure it's a button element, not an anchor
                                            className="btn mb-2 w-100"
                                            variant="outline-primary"
                                            aria-label="Add Attachments"
                                            onClick={handleButtonClick} // Trigger the input click on button click
                                            disabled={isLoading}
                                        >
                                            <IoCloudUploadOutline size={24} className='me-2' />
                                            {t('UPLOAD_ATTACHMENTS')}
                                        </Button>
                                    </AppTooltip>

                                    <input
                                        ref={fileInputRef} // Reference to the file input
                                        name="attachments"
                                        id="attachments"
                                        accept="image/jpeg,image/jpg,image/png,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf"
                                        // accept="image/png, image/jpeg, image/jpg"
                                        className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                        type="file"
                                        multiple={true}
                                        onChange={(event) => handleFileChange(event, formikProps?.setFieldValue)}
                                    />
                                </div> :

                                    <div className='position-relative'>
                                        {
                                            botSuggestion?.length > 0 ?
                                                <ReactSelect
                                                    error={formikProps.errors.suggestion}
                                                    options={[{ label: t('SELECT'), value: '' }, ...botSuggestion] ?? []}
                                                    value={formikProps.values.suggestion}
                                                    onChange={(option) => {
                                                        formikProps.setFieldValue(
                                                            "suggestion",
                                                            option?.target?.value ?? ""
                                                        );
                                                        if (option?.target?.value && option?.target?.value !== "") {
                                                            handleSuggestionSelect(option?.target?.value, option?.target?.label, formikProps?.setFieldValue, formikProps?.setFieldError)
                                                        }

                                                    }}
                                                    name="suggestion"
                                                    // className={formikProps.touched.suggestion && formikProps.errors.suggestion ? "is-invalid" : ""}
                                                    onBlur={formikProps.handleBlur}
                                                    // touched={formikProps.touched.suggestion}
                                                    readOnly={isLoading}
                                                /> :
                                                <>
                                                    <FormInputBox
                                                        inputClassName="custom-padding-right-42"
                                                        wrapperClassName='mb-0'
                                                        id="message"
                                                        placeholder={t("TYPE_A_MESSAGE")}
                                                        name="message"
                                                        error={formikProps.errors.message}
                                                        onBlur={formikProps.handleBlur}
                                                        onChange={formikProps.handleChange}
                                                        touched={formikProps.touched.message}
                                                        type="text"
                                                        value={formikProps.values.message || ""}
                                                        autoComplete="off"
                                                        readOnly={isLoading}
                                                    // isTextarea={true}
                                                    // rows={1}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        variant="link"
                                                        aria-label='Send Message'
                                                        className='p-2 theme-flip-x link-dark position-absolute top-0 end-0 z-1'
                                                        readOnly={isLoading}
                                                    >
                                                        <MdKeyboardBackspace size={24} />
                                                    </Button>
                                                </>
                                        }
                                        {/* <div className="overflow-hidden position-absolute top-0 z-1 flex-shrink-0  p-2 d-block h-100">
                                            <AppTooltip title="Add Attachments">
                                                <label
                                                    htmlFor="attachments"
                                                    className="link-primary cursor-pointer"
                                                    aria-label='Add Attachments'
                                                >
                                                    <MdAttachFile size={24} />
                                                </label>
                                            </AppTooltip>

                                            <input
                                                name="attachments"
                                                id="attachments"
                                                accept="image/png, image/jpeg, image/jpg"
                                                // accept="image/jpeg, image/jpg, image/png, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/rtf"
                                                className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                                type="file"
                                                multiple={true}
                                                onChange={(event) => handleFileChange(event, formikProps?.setFieldValue)}
                                            />
                                        </div> */}

                                    </div>
                            }


                        </div>
                    </Offcanvas.Body>
                )}
            </CommonFormikComponent>
        </React.Fragment>
    )
}

export default ChatBotForm