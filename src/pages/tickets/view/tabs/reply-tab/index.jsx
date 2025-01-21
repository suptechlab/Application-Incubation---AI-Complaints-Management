import { Form, Formik } from "formik";
import React, { useState } from "react";
import { Button, Card, Stack } from "react-bootstrap";
import { MdAttachFile } from "react-icons/md";
import { Link } from "react-router-dom";
import SunEditorReact from "../../../../../components/SuneditorReact";
import { validationSchema } from "../../../../../validations/ticketsManagement.validation";
import GenericModal from "../../../../../components/GenericModal";
import {
    ticketReplyToCustomer,
    ticketReplyInternal,
    internalNoteApi,
} from "../../../../../services/ticketmanagement.service";
import toast from "react-hot-toast";
import { validateFile } from "../../../../../utils/commonutils";
import { useTranslation } from "react-i18next";
import MentionEditor from "../../../../../components/MentionEditor";

const ReplyTab = ({ ticketId, setIsGetAcitivityLogs, ticketData, getTicketData, currentTab, permissionState }) => {

    const { t } = useTranslation()

    const [sendReplyModalShow, setSendReplyModalShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitAction, setSubmitAction] = useState(""); // Track which button is clicked

    // Handle Submit
    const handleSubmit = (values, actions) => {
        setLoading(true);

        // Prepare form data for API submission
        const formData = new FormData();
        formData.append("message", values.message);
        if (values.attachment) {
            formData.append("attachments[0]", values.attachment);
        }
        let apiCall;
        if (submitAction === "customer") {
            apiCall = ticketReplyToCustomer(ticketId, formData);
        } else if (submitAction === "internal_reply") {
            apiCall = ticketReplyInternal(ticketId, formData);
        } else if (submitAction === "internal_note") {
            apiCall = internalNoteApi(ticketId, formData); // Add your API call for internal_note
        }
        apiCall
            .then((response) => {
                if (submitAction === "customer") {
                    setSendReplyModalShow(false); // Close modal after success
                }
                actions.resetForm()
                getTicketData()
                setIsGetAcitivityLogs((prev) => !prev)
                toast.success(response?.data?.message)
            })
            .catch((error) => {
                console.error("Error:", error);
            })
            .finally(() => {
                setLoading(false);
                actions.setSubmitting(false); // Reset Formik's submitting state
            });
    };

    const isTicketNotClosedOrRejected = ticketData?.status !== "CLOSED" && ticketData?.status !== "REJECTED";
    return (
        <Formik
            initialValues={{
                message: "",
                attachment: null,
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
        >
            {({
                handleChange,
                handleBlur,
                values,
                setFieldError,
                setFieldValue,
                submitForm, // Access Formik's submitForm method
                touched,
                isValid,
                setFieldTouched,
                errors,
            }) => (
                <Form>
                    <MentionEditor
                        id="message"
                        name="message"
                        height="100"
                        ticketId={ticketId}
                        value ={values?.message ?? ''}
                        error ={errors?.message}
                        touched={touched?.message}
                        handleBlur={handleBlur}
                        handleChange={(event)=>{setFieldValue("message",event.target.value)}}
                    />
                    {/* <SunEditorReact
                        wrapperClassName="mb-0 editor-for-tab-view overflow-hidden"
                        id="message"
                        name="message"
                        height="100"
                        content={values.message}
                        error={errors?.message}
                        touched={touched?.message}
                        handleBlur={handleBlur}
                        handleChange={(value) => {
                            if (value === "<p><br></p>") {
                                setFieldValue("message", "");
                            } else {
                                setFieldValue("message", value);
                            }
                        }}
                    /> */}
                    {values.attachment && (
                        <div className="px-3 py-1">
                            <span
                                // target="_blank"
                                // to="#"
                                className="text-decoration-none small mw-100 text-break"
                            >
                                {values.attachment.name}
                            </span>
                        </div>
                    )}
                    <Card.Footer className="bg-body py-3">
                        <Stack direction="horizontal" gap={2} className="flex-wrap justify-content-end">
                            {
                                currentTab === "REPLY" &&

                                <div className="overflow-hidden position-relative z-1 flex-shrink-0 me-auto">
                                    <label
                                        htmlFor="attachment"
                                        className="small link-info align-middle cursor-pointer"
                                    >
                                        <span className="align-text-bottom">
                                            <MdAttachFile size={16} />
                                        </span>{" "}
                                        {t("ADD_ATTACHMENT")}
                                    </label>
                                    <input
                                        id="attachment"
                                        name="attachment"
                                        accept="image/jpeg, image/jpg, image/png, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/rtf"
                                        className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                        type="file"
                                        onChange={(event) => {
                                            const file = event.currentTarget.files[0];
                                            const isValidated = validateFile(file)
                                            if (isValidated === true) {
                                                setFieldValue("attachment", file);
                                            } else {
                                                toast.error(isValidated)
                                            }
                                            // Update Formik's state with the file
                                        }}
                                    />
                                </div>
                            }
                            {
                                currentTab === "REPLY" ?
                                    <Stack
                                        direction="horizontal"
                                        gap={2}
                                        className="flex-wrap justify-content-between justify-content-sm-end flex-fill"
                                    >


                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline-dark"
                                            onClick={() => {
                                                if (values.message === '') {
                                                    // Set an error for the message field
                                                    setFieldError("message", t("MESSAGE_REQUIRED"));
                                                    setFieldTouched("message", true);
                                                } else {
                                                    setSubmitAction("customer");
                                                    setSendReplyModalShow(true); // Show modal first
                                                }
                                            }}
                                            disabled={(permissionState?.replyToCustomerPermission !== true || loading || !isTicketNotClosedOrRejected)}
                                        >
                                            {loading && submitAction === "customer"
                                                ? t("SENDING")
                                                : t("REPLY_TO_CUSTOMER")}
                                        </Button>

                                        <Button
                                            type="submit"
                                            size="sm"
                                            variant="warning"
                                            onClick={() => setSubmitAction("internal_reply")}
                                            disabled={permissionState?.replyInternalPermission !== true || loading || !isTicketNotClosedOrRejected}
                                        >
                                            {loading && submitAction === "internal_reply"
                                                ? t("PROCESSING")
                                                : t("REPLY_INTERNALLY")}
                                        </Button>

                                    </Stack>
                                    : <div >
                                        <Button
                                            type="submit"
                                            size="sm"
                                            variant="warning"
                                            onClick={() => setSubmitAction("internal_note")}
                                            disabled={loading || !isTicketNotClosedOrRejected}
                                        >
                                            {loading && submitAction === "internal_note"
                                                ? t("PROCESSING")
                                                : t("ADD_INTERNAL_NOTE")}
                                        </Button>
                                    </div>
                            }
                        </Stack>
                    </Card.Footer>
                    {/* Send Reply Modal */}
                    <GenericModal
                        show={sendReplyModalShow}
                        handleClose={() => setSendReplyModalShow(false)}
                        modalHeaderTitle={t("SEND_REPLY")}
                        modalBodyContent={t("CONFIRM_SEND_REPLY")}
                        handleAction={() => {
                            setSendReplyModalShow(false);
                            submitForm(); // Submit the form after confirmation
                        }}
                        cancelButtonName={t("No")}
                        buttonName={t("YES")}
                    />
                </Form>
            )}
        </Formik>
    );
};

export default ReplyTab;
