import { Form, Formik } from "formik";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CommonViewData from "../../../components/CommonViewData";
import CommonDatePicker from "../../../components/commonDatePicker";
import { validationSchema } from "../../../validations/inquiryType.validation";

const DateExtensionModal = ({ modal, toggle }) => {
    const [startDate, setStartDate] = useState();
    const { t } = useTranslation();

    const handleSubmit = async (values, actions) => {
        console.log('values', values)
        actions.setSubmitting(false);
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
                <Modal.Title as="h4" className="fw-semibold">Date Extension</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={{
                    comments: "",
                    subStatus: "",
                    attchment: ""
                }}
                validationSchema={validationSchema}
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
                            <CommonViewData
                                label="Due Date"
                                value="06-25-24"
                            />
                            <CommonDatePicker
                                label="Enter Extended Date"
                                placeholder="Select"
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                            />
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
                                disabled={isSubmitting ?? false}
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

export default DateExtensionModal;