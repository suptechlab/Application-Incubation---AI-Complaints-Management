import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import FormInput from "../../../components/FormInput";
import ReactSelect from "../../../components/ReactSelect";
import { MasterDataContext } from "../../../contexts/masters.context";
import { convertToLabelValue, ticketCloseStatus } from "../../../services/ticketmanagement.service";
import { validateFile } from "../../../utils/commonutils";
import { ticketCloseValidation } from "../../../validations/ticketsManagement.validation";
import PropTypes from "prop-types"
const CloseTicketModal = ({ modal, toggle, ticketId, setSelectedStatus, setIsGetActivityLogs, getTicketData }) => {

    const { t } = useTranslation();
    const { masterData } = useContext(MasterDataContext)

    const [subStatus, setSubStatus] = useState([])

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (masterData?.closedStatus) {
            const closeStatus = convertToLabelValue(masterData?.closedStatus)
            setSubStatus(closeStatus)
        }
    }, [masterData])


    console.log(subStatus)

    //Handle File Change
    // const handleFileChange = (event) => {
    //     const file = event.currentTarget.files[0];
    //     if (file) {
    //         setFileName(file.name);
    //     } else {
    //         setFileName("");
    //     }
    // };

    const handleSubmit = async (values, actions) => {
        setLoading(true);
        // const formData = {
        //     reason: values?.reason,
        //     closeSubStatus: values?.closeSubStatus,
        // };
        // Prepare form data for API submission
        const formData = new FormData();
        formData.append("reason", values.reason);
        formData.append("closeSubStatus", values.closeSubStatus);
        if (values.claimAmount && values?.claimAmount !==''){
            formData.append("claimAmount", values.claimAmount);
        }
        if (values.attachments) {
            formData.append("attachments[0]", values.attachments);
        }
        ticketCloseStatus(ticketId, formData)
            .then((response) => {
                setSelectedStatus('CLOSED');
                setIsGetActivityLogs((prev) => !prev)
                if (values.attachments) {
                    getTicketData()
                }
                toast.success(response?.data?.message);
                toggle()
            })
            .catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message);
                }
            })
            .finally(() => {
                setLoading(false)
                actions.setSubmitting(false);
            });
    };
    return (
        <Modal
            show={modal}
            onHide={toggle}
            backdrop="static"
            keyboard={false}
            centered={true}
            scrollable={true}
            size="sm"
            className="theme-modal"
            enforceFocus={false}
        >
            <Modal.Header className="pb-3">
                <Modal.Title as="h4" className="fw-semibold">{t("TICKET_CLOSE_STATUS")}</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={{
                    reason: "",
                    closeSubStatus: "",
                    attachments: null,
                    claimAmount: ''
                }}
                validationSchema={ticketCloseValidation}
                onSubmit={handleSubmit}
            >
                {({
                    isSubmitting,
                    handleChange,
                    handleBlur,
                    values,
                    setFieldValue,
                    setFieldError,
                    touched,
                    isValid,
                    errors,
                }) => (
                    <Form>

                        <Modal.Body className="text-break py-0">
                            <FormInput
                                label={t("COMMENT")}
                                id="reason"
                                name="reason"
                                type="text"
                                as="textarea"
                                rows={5}
                                onBlur={handleBlur}
                                value={values?.reason}
                                onChange={handleChange}
                                error={errors?.reason}
                                touched={touched?.reason}
                            />
                            <ReactSelect
                                label={t("SUB-STATUS")}
                                error={errors.closeSubStatus}
                                options={[
                                    { label: t("SELECT"), value: "" },
                                    ...subStatus.map((group) => ({
                                        label: group.label,
                                        value: group.value,
                                    })),
                                ]}
                                value={values.closeSubStatus}
                                onChange={(option) => {
                                    setFieldValue(
                                        "closeSubStatus",
                                        option?.target?.value ?? ""
                                    );
                                }}
                                name="closeSubStatus"
                                className={touched.closeSubStatus && errors.closeSubStatus ? "is-invalid" : ""}
                                onBlur={handleBlur}
                                touched={touched.closeSubStatus}
                            />

                            {
                                (values?.closeSubStatus === 'CLOSED_IN_FAVOR_OF_CONSUMER' || values?.closeSubStatus === 'CLOSED_IN_PARTIAL_FAVOR_OF_CONSUMER') &&
                                <FormInput
                                    label={t("CLAIM_AMOUNT")}
                                    id="claimAmount"
                                    name="claimAmount"
                                    type="number"

                                    rows={5}
                                    onBlur={handleBlur}
                                    value={values?.claimAmount}
                                    onChange={handleChange}
                                    error={errors?.claimAmount}
                                    touched={touched?.claimAmount}
                                />

                            }
                            <Col xs={12} className="mb-3 pb-1">
                                <div className="mb-1 fs-14">{t("ATTACHMENT")}</div>
                                <div className="theme-upload-cover d-inline-flex align-items-center gap-3">
                                    <div className="overflow-hidden position-relative z-1 flex-shrink-0">
                                        <label
                                            htmlFor="attachments"
                                            className="btn btn-outline-dark custom-min-width-85"
                                        >
                                            {t("BROWSE")}
                                        </label>
                                        {/* <input
                                            id="files"
                                            accept="image/png, image/jpeg, image/jpg"
                                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                            type="file"
                                            onChange={handleFileChange}
                                        /> */}
                                        <input
                                            id="attachments"
                                            name="attachments"
                                            accept="image/jpeg, image/jpg, image/png, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/rtf"
                                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                            type="file"
                                            onChange={(event) => {
                                                const file = event.currentTarget.files[0];
                                                const isValidated = validateFile(file)
                                                if (isValidated === true) {
                                                    setFieldValue("attachments", file);
                                                } else {
                                                    toast.error(isValidated)
                                                }
                                                // Update Formik's state with the file
                                            }}
                                        />
                                    </div>
                                    {values?.attachments && (
                                        <span
                                            // target="_blank"
                                            // to="/fi-users/import"
                                            className="text-decoration-none small mw-100 text-break"
                                        >
                                            {values.attachments.name}
                                        </span>
                                    )}
                                </div>
                            </Col>
                        </Modal.Body>
                        <Modal.Footer className="pt-0">
                            <Button
                                type="button"
                                variant="outline-dark"
                                onClick={toggle}
                                className="custom-min-width-85"
                            >
                                {t("CANCEL")}
                            </Button>
                            <Button
                                type="submit"
                                variant="warning"
                                className="custom-min-width-85"
                                disabled={loading ?? false}
                            >
                                {t("SUBMIT")}
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

CloseTicketModal.propTypes = {
    modal: PropTypes.bool.isRequired, // modal is a boolean (required)
    toggle: PropTypes.func.isRequired, // toggle is a function (required)
    ticketId: PropTypes.string.isRequired, // ticketId is a string (required)
    setSelectedStatus: PropTypes.func.isRequired, // setSelectedStatus is a function (required)
    setIsGetActivityLogs: PropTypes.func.isRequired, // setIsGetActivityLogs is a function (required)
    getTicketData: PropTypes.func.isRequired, // getTicketData is a function (required)
  };
export default CloseTicketModal;