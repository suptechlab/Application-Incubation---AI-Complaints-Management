import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Offcanvas, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { MdAttachFile, MdKeyboardBackspace, MdPerson } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import CommonFormikComponent from '../../../components/CommonFormikComponent';
import FormInputBox from '../../../components/FormInput';
import SvgIcons from '../../../components/SVGIcons';
import { sendQuery } from '../../../redux/slice/helpDeskSlice';
import AppTooltip from '../../../components/tooltip';

const ChatBotForm = () => {
    const { t } = useTranslation()
    const chatEndRef = useRef(null);
    const [isLoading, setLoading] = useState(false)
    const dispatch = useDispatch()
    // Initial Values
    const initialValues = {
        message: '',
    };

    const { queryError } = useSelector((state) => state.helpDeskSlice);
    const [chatEnded, setChatEnded] = useState(false)


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
    const actionButtonHandler = async (event, msgData) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Send the message to the API
            const result = await dispatch(sendQuery(msgData));
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
    // Handle Submit Handler
    const handleSubmit = async (values, actions) => {
        actions.setSubmitting(true); // Set submitting state
        setLoading(true)
        try {
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

            // Proceed only if the message is valid
            if (values?.message) {
                const msgData = { message: values.message };

                // Add sender ID if available
                if (senderId) {
                    msgData.sender = senderId;
                }

                // Dispatch the API query
                const result = await dispatch(sendQuery(msgData));
                if (sendQuery.fulfilled.match(result)) {
                    setChatResponse(result.payload); // Set chat response on success
                } else {
                    setChatError(); // Handle API failure
                }
            }
        } catch (error) {
            setChatError(); // Handle unexpected errors
            console.error("Error in handleSubmit:", error);
        } finally {
            setLoading(false)
            actions.setSubmitting(false); // Ensure submitting is turned off
        }
    };

    // SET CHAT RESPONSE IN STATE
    const setChatResponse = (chatResponse) => {
        setChatData((prevChatData) => {
            // Map through the apiResponse to create new chat data
            const newChatData = chatResponse?.map((item, index) => {
                const hasButtons = item.buttons && item.buttons.length > 0;
                return {
                    id: prevChatData.length + index + 1,
                    message: <>{item.text}</>,
                    userMode: false,
                    botViewMode: true,
                    recipientId: item.recipientId,
                    botReview: hasButtons
                        ? item.buttons.map((btn, idx) => ({
                            id: idx + 1,
                            suggestion: btn.title,
                            // positive: idx === 0, // Assuming the first button is positive
                            positive: (item.buttons?.length === 2 && idx === 0),
                            payload: btn.payload,
                        }))
                        : [],
                    botSuggestion: [],
                };
            });

            // Return the new chat data
            return [...prevChatData, ...newChatData];
        });
        const lastRecipientId = chatResponse.at(-1)?.recipientId;
        if (lastRecipientId) setSenderId(lastRecipientId);
    }

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


    return (
        <React.Fragment>
            <Offcanvas.Header closeButton className='align-items-start pb-1'></Offcanvas.Header>
            <CommonFormikComponent
                // validationSchema={ChatBotFormSchema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <Offcanvas.Body className="text-break d-flex flex-column small p-0">
                        {/* Chatbot Body */}
                        <div className='chatbot-body d-flex flex-column flex-grow-1 overflow-auto px-3'>
                            {/* Message Repeater Section */}
                            {chatData?.map((messageItem) => {
                                const { id, message, userMode, botViewMode, botSuggestion, botReview, recipientId, error } = messageItem;
                                return (
                                    <div
                                        key={id}
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
                                                {botReview && botReview.length > 0 && (
                                                    <Stack
                                                        direction="horizontal"
                                                        gap={2}
                                                        className="flex-wrap mt-3"
                                                    >
                                                        {botReview.map((actionItem) => {
                                                            const { id, suggestion, positive, payload } = actionItem;
                                                            return (
                                                                <Button
                                                                    key={id}
                                                                    type="button"
                                                                    variant={positive ? "success" : "light"}
                                                                    className={`bot-tag-btns text-start border-opacity-50 border-primary fs-6 lh-sm py-2 ${positive ? "text-white" : "text-body"}`}
                                                                    onClick={(event) => actionButtonHandler(event, { message: payload, sender: recipientId })}
                                                                >
                                                                    {suggestion}
                                                                </Button>
                                                            )
                                                        })}
                                                    </Stack>
                                                )}
                                            </div>
                                        </Stack>
                                        {botSuggestion && botSuggestion.length > 0 && (
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
                                        )}
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
                            {/* <div className='me-auto mb-2'>
                                    <Badge
                                        pill
                                        bg='info-subtle'
                                        className='text-info'
                                    >
                                        {"fileName"}
                                    </Badge>
                                </div> */}
                            <div className='position-relative'>

                                <FormInputBox
                                    wrapperClassName='mb-0'
                                    inputClassName="ps-5"
                                    id="message"
                                    placeholder="Type a message"
                                    name="message"
                                    error={formikProps.errors.message}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.message}
                                    type="text"
                                    value={formikProps.values.message || ""}
                                    autoComplete="off"
                                    readOnly={isLoading}
                                />
                                <div className="overflow-hidden position-absolute top-0 z-1 flex-shrink-0  p-2 d-block h-100">
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
                                        // accept="image/png, image/jpeg, image/jpg"
                                        accept="image/jpeg, image/jpg, image/png, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/rtf"
                                        className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                        type="file"
                                        // onChange={(event) => handleFileChange(event, formikProps?.setFieldValue)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="link"
                                    aria-label='Send Message'
                                    className='p-2 theme-flip-x link-dark position-absolute top-0 end-0 z-1'
                                    readOnly={isLoading}
                                >
                                    <MdKeyboardBackspace size={24} />
                                </Button>
                            </div>
                        </div>
                    </Offcanvas.Body>
                )}
            </CommonFormikComponent>
        </React.Fragment>
    )
}

export default ChatBotForm