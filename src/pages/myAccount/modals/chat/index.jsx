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
import { downloadDocument, replyOnTicket, ticketConversationList } from '../../../../redux/slice/fileClaimSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment/moment';
import { FiImage, FiFileText } from "react-icons/fi";
import { FaRegFile, FaFileWord, FaFileAlt } from "react-icons/fa";
import { downloadFile, isHTML } from '../../../../constants/utils';

const ClaimChat = ({ handleShow, handleClose, selectedRow }) => {

    const dispatch = useDispatch()
    const messagesEndRef = useRef(null);
    const [fileName, setFileName] = useState("");

    const [isLoading, setIsLoading] = useState(false)
    const { t } = useTranslation()

    //Dummy Chat 
    const [chatData, setChatData] = useState([])
    // Initial Values
    const initialValues = {
        message: '',
        attachments: null
    };

    //Handle File Change
    const handleFileChange = (event, setFieldsValue) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            setFieldsValue("attachments", file)
        } else {
            setFieldsValue("attachments", null)
        }
    };

    // Handle Submit Handler
    const handleSubmit = async (values, actions) => {
        actions.setSubmitting(true)
        setIsLoading(true);
        let replyData = { message: values?.message, attachments: values?.attachments };
        const formData = new FormData();
        Object.entries(replyData).forEach(([key, value]) => {
            if (key === "attachments" && value !== null) {
                formData.append(`attachments[0]`, values?.attachments);
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        // Dispatch the FormData
        const result = await dispatch(replyOnTicket({ ticketId: selectedRow?.id, data: formData }));
        setIsLoading(false);
        actions.setSubmitting(false)
        if (replyOnTicket.fulfilled.match(result)) {
            actions.setSubmitting(false);
            actions.resetForm();
            setFileName("")
            const upateUserData = {
                id: chatData.length + 1,
                message: values.message,
                userMode: true,
            }
            setChatData([...chatData, upateUserData]);
            await getConversationData();
        } else {
            console.error('Verification error:', result);
        }
    };

    // [
    //     {
    //         id: 1,
    //         message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
    //         userMode: false,
    //         userName: "Agent John",
    //         dateTime: "07-11-24 | 04:35 pm",
    //         attachments: [],
    //     },
    //     {
    //         id: 2,
    //         message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. `,
    //         userMode: true,
    //         userName: "",
    //         dateTime: "07-11-24 | 04:35 pm",
    //         attachments: [
    //             {
    //                 id: 1,
    //                 fileName: "claim_file.pdf",
    //             }
    //         ],
    //     },
    //     {
    //         id: 3,
    //         message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy tex.`,
    //         userMode: false,
    //         userName: "Agent John",
    //         dateTime: "07-11-24 | 04:35 pm",
    //         attachments: [],
    //     }
    // ]


    // Scroll to the bottom of the messages container when new messages are added
    useEffect(() => {
        if (messagesEndRef?.current) {
            messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatData]);


    const getConversationData = async () => {
        setIsLoading(true);
        const result = await dispatch(ticketConversationList(selectedRow?.id));
        setIsLoading(false);
        if (ticketConversationList.fulfilled.match(result)) {
            const chatActivities = result?.payload?.map((chat, index) => {
                const text = chat?.activityDetails?.text || ""; // Safely extract text
                const containsHTML = isHTML(text);
               return {
                    id: chat?.id,
                    message: <> {containsHTML ? (
                        <p className="" dangerouslySetInnerHTML={{ __html: text }} />
                      ) : (
                        <p className="">{text}</p>
                      )}</>,
                    userMode: chat?.activityType === "CUSTOMER_REPLY" ? true : false,
                    userName: chat?.performBy?.name,
                    dateTime: chat?.performedAt ? moment(chat?.performedAt).format('DD-MM-YY | hh:mm:ss') : '',
                    attachments: chat?.attachmentUrl?.attachments && chat?.attachmentUrl?.attachments?.length > 0 ? chat?.attachmentUrl?.attachments : []
                }
            })
            setChatData(chatActivities ?? [])
        } else {
            console.error('Verification error:', result);
        }
    }



    const EXTENSION_ICON_MAP = {
        "jpeg": <FiImage size={24} />,
        "jpg": <FiImage size={24} />,
        "png": <FiImage size={24} />,
        "pdf": <MdPictureAsPdf size={24} />,
        "txt": <FiFileText size={24} />,
        "doc": <FaFileWord size={24} />,
        "docx": <FaFileWord size={24} />,
        "rtf": <FaFileAlt size={24} />,
    };

    const getFileExtension = (originalTitle) => {
        if (!originalTitle) return null;
        const parts = originalTitle.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : null;
    };
    const getIconForFile = (originalTitle) => {
        const extension = getFileExtension(originalTitle);
        return extension && EXTENSION_ICON_MAP[extension] ? EXTENSION_ICON_MAP[extension] : <FaRegFile size={24} />;
    };
    useEffect(() => {
        setFileName('');
        if (selectedRow?.id) {
            getConversationData()
        }else{
            setChatData([])
        }
    }, [selectedRow])

    // ATTACHMENT DOWNLOAD
    const handleAttachmentDownload = async(id,attachmentData) => {
        // WRITE HERE FUNCTION FOR ATTACHMENT DOWNLOAD
        setIsLoading(true);
        const result = await dispatch(downloadDocument(id));
        if (downloadDocument.fulfilled.match(result)) {
            downloadFile(result?.payload,attachmentData?.originalTitle).then(()=>{
               
            }).catch((error)=>{

            }).finally(()=>{
                setIsLoading(false)
            })
            
        } else {
            setIsLoading(false);
        }
    }
   
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
                                                                    const { id,externalDocumentId, originalTitle } = actionItem;
                                                                    return (
                                                                        <button
                                                                            key={id}
                                                                            onClick={() => handleAttachmentDownload(externalDocumentId , actionItem)}
                                                                            className='btn fw-semibold text-decoration-none link-primary'
                                                                        >
                                                                            <span className='me-2 '> {getIconForFile(originalTitle)}</span>{originalTitle}
                                                                        </button>
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
                            {/* {
                                chatData && chatData?.length > 0 &&
                                <Stack direction='horizontal' className='position-relative justify-content-center border-top border-2 border-opacity-10 border-black my-4'>
                                    <span className='bg-body-tertiary fs-12 fw-semibold lh-sm position-absolute px-2 py-1 start-50 text-black text-opacity-50 top-50 translate-middle z-1'>Chat Ended</span>
                                </Stack>
                            } */}
                           
                            {
                                chatData && chatData?.length === 0 && isLoading === false &&
                                <Stack direction='horizontal' className='position-relative justify-content-center border-top border-2 border-opacity-10 border-black my-4'>
                                    <span className='bg-body-tertiary fs-12 fw-semibold lh-sm position-absolute px-2 py-1 start-50 text-black text-opacity-50 top-50 translate-middle z-1'>{t("NO_CHAT_AVAILABLE")}</span>
                                </Stack> 
                               
                            }
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
                                        onChange={(event) => handleFileChange(event, formikProps?.setFieldValue)}
                                    />
                                </div>
                                <FormInputBox
                                    wrapperClassName='mb-0 flex-fill'
                                    inputClassName="border-0 shadow-none px-1 py-3"
                                    id="message"
                                    placeholder={t("ASK_OR_REPLY...")}
                                    name="message"
                                    error={formikProps.errors.message}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.message}
                                    type="text"
                                    value={formikProps.values.message || ""}
                                    autoComplete="off"
                                    disabled = {formikProps?.isSubmitting ?? false}
                                />
                                <AppTooltip title="Send">
                                    <Button
                                        type="submit"
                                        variant="link"
                                        className='p-2 link-primary me-n2'
                                        aria-label='Send Message'
                                        disabled={formikProps?.isSubmitting ?? false}
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