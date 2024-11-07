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

    //Dummy Chat 
    const [chatData, setChatData] = useState([
        {
            id: 1,
            message: `Ok! so as you want to know about Credit Data Registry. Tell me what can i help you in that ?`,
            userMode: false,
        },
        {
            id: 2,
            message: `In eget efficitu sem facilisis veh vestibulum, enim elit volutpat velit, eu faucibus erat metus at diam. I`,
            userMode: true,
        },
        {
            id: 3,
            message: `Cras aliquam id orci pharetra malesa. Aliquamrt nec mattis augue, art aliqu quam. In eget efficitu sem facilisis veh vestibulum, enim elit volutpat velit, eu faucibus erat metus at diam. Integer vitae nisl et le eleifend aliquam quam. In eget efficitur.`,
            userMode: false,
        },
    ])

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
        console.log("values", values);
    };

    return (
        <React.Fragment>
            <Offcanvas.Header closeButton className='align-items-start'></Offcanvas.Header>
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
                                const { id, message, userMode } = messageItem;
                                return (
                                    <div key={id} className={userMode ? 'text-end' : ''}>
                                        <Stack direction="horizontal" gap={2} className="mb-4 align-items-start d-inline-flex mw-100">
                                            <span className={`flex-shrink-0 align-items-center custom-height-48 custom-width-48 d-inline-flex justify-content-center rounded-pill ${userMode ? 'bg-body-tertiary text-body text-opacity-50 order-last' : 'bg-warning text-white'}`}>
                                                {userMode ? <MdPerson size={32} /> : SvgIcons.RobotIcon(30, 30)}
                                            </span>
                                            <div className={`my-auto rounded p-2 ${userMode ? 'bg-body-tertiary text-start' : 'bg-warning bg-opacity-10'}`}>{message}</div>
                                        </Stack>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Chatbot Body Footer */}
                        <div className='chatbot-body-footer p-3'>
                            <div className='position-relative'>
                                <FormInputBox
                                    wrapperClassName='mb-0'
                                    id="message"
                                    key={"message"}
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