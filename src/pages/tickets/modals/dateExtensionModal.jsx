import { Form, Formik } from "formik";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CommonViewData from "../../../components/CommonViewData";
import CommonDatePicker from "../../../components/commonDatePicker";
import {slaDateValidation} from "../../../validations/ticketsManagement.validation";
import moment from "moment/moment";
import toast from "react-hot-toast";
import { slaDateExtensionApi } from "../../../services/ticketmanagement.service";

const DateExtensionModal = ({ modal, toggle, ticketData,getTicketData }) => {

    const { t } = useTranslation();

    const handleSubmit = async (values, actions) => {
        actions.setSubmitting(true);
        if (values?.date) {
            slaDateExtensionApi(ticketData?.id, moment(values?.date).format('yyyy-MM-DD'))
                .then((response) => {
                    toast.success(response?.data?.message);
                    getTicketData()
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
                    actions.setSubmitting(false);
                });
        }else{
            actions.setSubmitting(false);
        }
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
                <Modal.Title as="h4" className="fw-semibold">{t("DATE_EXTENSION")}</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={{
                    date: "",
                }}
                validationSchema={slaDateValidation}
                onSubmit={(values, actions) => {
                    handleSubmit(values, actions)
                }}
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
                                label={t("DUE_DATE")}
                                value={ticketData?.slaBreachDate ? moment(ticketData?.slaBreachDate).format("DD-MM-YYYY") : 'N/A'}
                            />
                            
                            <CommonDatePicker
                                error={errors?.date}
                                id="date"
                                key={"date"}
                                name="date"
                                touched={touched?.date}
                                label="Enter Extended Date"
                                placeholder={t("SELECT")}
                                selected={values?.date}
                                onChange={(date) => setFieldValue("date", date)}
                                minDate={ticketData?.slaBreachDate}
                                // isBackDateBlocked={true}
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