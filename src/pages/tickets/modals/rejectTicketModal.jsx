import { Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FormInput from "../../../components/FormInput";
import ReactSelect from "../../../components/ReactSelect";
import { MasterDataContext } from "../../../contexts/masters.context";
import { convertToLabelValue, ticketCloseStatus, ticketRejectStatus } from "../../../services/ticketmanagement.service";
import { ticketRejectValidation } from "../../../validations/ticketsManagement.validation";
import toast from "react-hot-toast";
const RejectTicketModal = ({ modal, toggle, ticketId,  setSelectedStatus,setIsGetAcitivityLogs }) => {
    const { t } = useTranslation();
    const [fileName, setFileName] = useState("Fi_Users_data.xlsx");

    const { masterData } = useContext(MasterDataContext)

    const [subStatus, setSubStatus] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        if (masterData?.rejectedStatus) {
            const rejectStatus = convertToLabelValue(masterData?.rejectedStatus)
            setSubStatus(rejectStatus)
        }
    }, [masterData])

    //Handle File Change
    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("Fi_Users_data.xlsx");
        }
    };

    const handleSubmit = async (values, actions) => {
        // actions.setSubmitting(true);
        setLoading(true)
        const formData = {
            reason: values?.reason,
            rejectedStatus: values?.rejectedStatus,
        };
        ticketRejectStatus(ticketId, formData)
            .then((response) => {
                setSelectedStatus('REJECTED');
                setIsGetAcitivityLogs((prev)=> !prev)
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
                <Modal.Title as="h4" className="fw-semibold">Ticket Reject Status</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={{
                    reason: "",
                    rejectedStatus: "",
                }}
                validationSchema={ticketRejectValidation}
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
                                label="Comments"
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
                                label="Sub-status"
                                error={errors.rejectedStatus}
                                options={[
                                    { label: t("SELECT"), value: "" },
                                    ...subStatus.map((group) => ({
                                        label: group.label,
                                        value: group.value,
                                    })),
                                ]}
                                value={values.rejectedStatus}
                                onChange={(option) => {
                                    setFieldValue(
                                        "rejectedStatus",
                                        option?.target?.value ?? ""
                                    );
                                }}
                                name="rejectedStatus"
                                className={touched.rejectedStatus && errors.rejectedStatus ? "is-invalid" : ""}
                                onBlur={handleBlur}
                                touched={touched.rejectedStatus}
                            />
                            {/* <Col xs={12} className="mb-3 pb-1">
                                <div className="mb-1 fs-14">Attchment</div>
                                <div className="theme-upload-cover d-inline-flex align-items-center gap-3">
                                    <div className="overflow-hidden position-relative z-1 flex-shrink-0">
                                        <label
                                            htmlFor="files"
                                            className="btn btn-outline-dark custom-min-width-85"
                                        >
                                            Browse
                                        </label>
                                        <input
                                            id="files"
                                            accept="image/png, image/jpeg, image/jpg"
                                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {fileName && (
                                        <Link
                                            target="_blank"
                                            to="/fi-users/import"
                                            className="text-decoration-none small mw-100 text-break"
                                        >
                                            {fileName}
                                        </Link>
                                    )}
                                </div>
                            </Col> */}
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

export default RejectTicketModal;