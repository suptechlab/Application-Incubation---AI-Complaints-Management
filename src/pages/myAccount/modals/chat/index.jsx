import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Image, Modal, Stack } from 'react-bootstrap';
import { MdAttachFile, MdPictureAsPdf, MdSend } from 'react-icons/md';
import { Link } from 'react-router-dom';
import defaultAvatar from "../../../../assets/images/default-avatar.jpg";
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormInputBox from '../../../../components/FormInput';
import SvgIcons from '../../../../components/SVGIcons';
import AppTooltip from '../../../../components/tooltip';
import { useTranslation } from 'react-i18next';
import { ChatSchema } from '../../validations';

const ClaimChat = ({ handleShow, handleClose, selectedRow }) => {
    const messagesEndRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const { t } = useTranslation()

    // Initial Values
    const initialValues = {
        message: '',
    };

    //Handle File Change
    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("Fi_Users_data.xlsx");
        }
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
            id: 1,
            message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
            userMode: false,
            userName: "Agent John",
            dateTime: "07-11-24 | 04:35 pm",
            attachments: [],
        },
        {
            id: 2,
            message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. `,
            userMode: true,
            userName: "",
            dateTime: "07-11-24 | 04:35 pm",
            attachments: [
                {
                    id: 1,
                    fileName: "claim_file.pdf",
                }
            ],
        },
        {
            id: 3,
            message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy tex.`,
            userMode: false,
            userName: "Agent John",
            dateTime: "07-11-24 | 04:35 pm",
            attachments: [],
        }
    ])

    // Scroll to the bottom of the messages container when new messages are added
    useEffect(() => {
        if (messagesEndRef?.current) {
            messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatData]);

    return (
        <Modal
            show={handleShow}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered={true}
            scrollable={true}
            size="lg"
            className="theme-modal"
            enforceFocus={false}
        >
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title as="h4" className="fw-bold">
                    {t('CLAIM')} ID: #{`${selectedRow?.ticketId}`}
                </Modal.Title>
            </Modal.Header>
            <CommonFormikComponent
                initialValues={initialValues}
                validationSchema={ChatSchema}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <React.Fragment>
                        <Modal.Body className="text-break small">
                            {/* Message Repeater Section */}
                            {chatData?.map((messageItem) => {
                                const { id, message, userMode, userName, dateTime, attachments } = messageItem;
                                return (
                                    <div
                                        key={id}
                                        className={`mb-4 ${userMode ? 'text-end' : ''}`}
                                    >

                                        <Stack
                                            direction="horizontal"
                                            gap={3}
                                            className="align-items-start d-inline-flex col-10"
                                        >
                                            {userMode ? '' :
                                                <span
                                                    className="flex-shrink-0"
                                                >
                                                    <Image
                                                        className="object-fit-cover rounded-circle"
                                                        src={defaultAvatar}
                                                        width={32}
                                                        height={32}
                                                        alt={userName}
                                                    />
                                                </span>
                                            }
                                            <div className='ms-auto'>
                                                <div className='mb-1 text-start'>
                                                    {userName &&
                                                        <>
                                                            <span className='me-2 fw-semibold'>{userName}</span>
                                                            <span className='me-2 opacity-75'>{SvgIcons.dotIcon}</span>
                                                        </>
                                                    }
                                                    <span className='custom-font-size-12 opacity-75'>{dateTime}</span>
                                                </div>
                                                <div
                                                    className={`p-2 fw-medium my-auto rounded ${userMode ? 'bg-primary-4 text-start' : 'bg-body-secondary'}`}
                                                >
                                                    <div className='p-1'>
                                                        {message}
                                                        {attachments && attachments?.length > 0 && (
                                                            <Stack
                                                                direction="horizontal"
                                                                gap={3}
                                                                className="flex-wrap mt-2"
                                                            >
                                                                {attachments?.map((actionItem) => {
                                                                    const { id, fileName } = actionItem;
                                                                    return (
                                                                        <Link
                                                                            key={id}
                                                                            to=""
                                                                            className='fw-semibold text-decoration-none'
                                                                        >
                                                                            <span className='me-2'><MdPictureAsPdf size={24} /></span>{fileName}
                                                                        </Link>
                                                                    )
                                                                })}
                                                            </Stack>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </Stack>
                                    </div>
                                )
                            })}
                            <Stack direction='horizontal' className='position-relative justify-content-center border-top border-2 border-opacity-10 border-black my-4'>
                                <span className='bg-body-tertiary fs-12 fw-semibold lh-sm position-absolute px-2 py-1 start-50 text-black text-opacity-50 top-50 translate-middle z-1'>Chat Ended</span>
                            </Stack>
                            <div ref={messagesEndRef} />
                        </Modal.Body>
                        <Modal.Footer className="border-top py-0 flex-column">
                            <Stack
                                direction='horizontal'
                                gap={2}
                                className='flex-fill'
                            >
                                <div className="overflow-hidden position-relative z-1 flex-shrink-0">
                                    <AppTooltip title="Add Attachments">
                                        <label
                                            htmlFor="files"
                                            className="link-primary cursor-pointer"
                                            aria-label='Add Attachments'
                                        >
                                            <MdAttachFile size={24} />
                                        </label>
                                    </AppTooltip>
                                    <input
                                        id="files"
                                        accept="image/png, image/jpeg, image/jpg"
                                        className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <FormInputBox
                                    wrapperClassName='mb-0 flex-fill'
                                    inputClassName="border-0 shadow-none px-1 py-3"
                                    id="message"
                                    placeholder="Ask or reply..."
                                    name="message"
                                    error={formikProps.errors.message}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.message}
                                    type="text"
                                    value={formikProps.values.message || ""}
                                    autoComplete="off"
                                />
                                <AppTooltip title="Send">
                                    <Button
                                        type="submit"
                                        variant="link"
                                        className='p-2 link-primary me-n2'
                                        aria-label='Send Message'
                                    >
                                        <MdSend size={24} />
                                    </Button>
                                </AppTooltip>
                            </Stack>

                            {fileName && (
                                <div className='me-auto'>
                                    <Badge
                                        pill
                                        bg='info-subtle'
                                        className='text-info'
                                    >
                                        {fileName}
                                    </Badge>
                                </div>
                            )}
                        </Modal.Footer>
                    </React.Fragment>
                )}
            </CommonFormikComponent>
        </Modal>
    )
}

export default ClaimChat