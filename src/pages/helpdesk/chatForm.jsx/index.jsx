import React, { useState } from 'react';
import { Button, Offcanvas, Stack } from 'react-bootstrap';
import { MdKeyboardBackspace, MdPerson } from 'react-icons/md';
import CommonFormikComponent from '../../../components/CommonFormikComponent';
import FormInputBox from '../../../components/FormInput';
import SvgIcons from '../../../components/SVGIcons';
import { ChatBotFormSchema } from '../validations';

const ChatBotForm = () => {
    // Initial Values
    const initialValues = {
        message: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        const upateUserData = {
            id: chatData.length + 1,
            message: values.message,
            userMode: true,
        }
        setChatData([...chatData, upateUserData])

        actions.setSubmitting(false);
        actions.resetForm();
    };

    //Dummy Chat 
    const [chatData, setChatData] = useState([
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
    ])

    // Action Button Handler
    const actionButtonHandler = (id) => {
        console.log(`Button with suggestion ${id} clicked!`);
    };

    return (
        <React.Fragment>
            <Offcanvas.Header closeButton className='align-items-start pb-1'></Offcanvas.Header>
            <CommonFormikComponent
                validationSchema={ChatBotFormSchema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <Offcanvas.Body className="text-break d-flex flex-column small p-0">
                        {/* Chatbot Body */}
                        <div className='chatbot-body d-flex flex-column flex-grow-1 overflow-auto px-3'>
                            {/* Message Repeater Section */}
                            {chatData?.map((messageItem) => {
                                const { id, message, userMode, botViewMode, botSuggestion, botReview } = messageItem;
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
                            <Stack direction='horizontal' className='position-relative justify-content-center border-top border-2 border-opacity-10 border-black my-4'>
                                <span className='bg-body-tertiary fs-12 fw-semibold lh-sm position-absolute px-2 py-1 start-50 text-black text-opacity-50 top-50 translate-middle z-1'>Chat Ended</span>
                            </Stack>
                        </div>

                        {/* Chatbot Body Footer */}
                        <div className='chatbot-body-footer p-3'>
                            <div className='position-relative'>
                                <FormInputBox
                                    wrapperClassName='mb-0'
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
                                />
                                <Button
                                    type="submit"
                                    variant="link"
                                    aria-label='Send Message'
                                    className='p-2 theme-flip-x link-dark position-absolute top-0 end-0 z-1'
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