import { Formik, Form } from "formik";
import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { Button } from "react-bootstrap";
import Toggle from '../../../components/Toggle';
import { handleAddDistrict } from "../../../services/district.service";
import toast from 'react-hot-toast';
import ReactSelect from "../../../components/ReactSelect";
import { validationSchema } from "../../../validations/claimSubType.validation";
import { useTranslation } from "react-i18next";
import { createNewClaimSubType } from "../../../services/claimSubType.service";


const Add = ({ modal, toggle, dataQuery, claimTypes }) => {

    const { t } = useTranslation()

    const handleSubmit = async (values, actions) => {
        const formData = {
            name: values?.name ?? "",
            claimTypeId: values?.claimType ?? null,
            slaBreachDays: values?.slaBreachDays ?? null,
            description: values?.description ?? "",
        }

        createNewClaimSubType(formData).then(response => {
            toast.success(response?.data?.message);
            dataQuery.refetch()
            toggle()
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message);
            }
        }).finally(() => {
            actions.setSubmitting(false);
        });
    };

    return (
        <Modal className="district-modal-cover" isOpen={modal} toggle={toggle} centered >
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>Create Claim Sub Type</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        name: "",
                        claimType: "",
                        slaBreachDays: "",
                        description: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, actions) => {
                        actions.setSubmitting(true);
                        handleSubmit(values, actions);
                    }}
                >
                    {({
                        errors,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        isSubmitting,
                        touched,
                        setFieldValue,
                        values,
                    }) => (
                        <Form>
                            <FormInput
                                error={errors?.name}
                                id="name"
                                key={"name"}
                                label={t("NAME OF CLAIM SUB TYPE")}
                                name="name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched?.name}
                                type="text"
                                value={values?.name || ""}
                            />
                            <ReactSelect
                                error={errors?.claimType}
                                options={claimTypes ?? []}
                                value={values?.claimType}
                                onChange={(option) => { setFieldValue('claimType', option?.target?.value ?? '') }}
                                name="claimType"
                                label="Claim Type"
                                className={`${touched?.claimType && errors?.claimType ? "is-invalid" : ""} mb-3`}
                                onBlur={handleBlur}
                                touched={touched?.claimType}
                            />
                            <FormInput
                                error={errors.slaBreachDays}
                                id="slaBreachDays"
                                key={"slaBreachDays"}
                                label={t("SLA BREACH DAY")}
                                name="slaBreachDays"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.slaBreachDays}
                                type="number"
                                value={values?.slaBreachDays}
                            />
                            <FormInput
                                error={errors?.description}
                                id="description"
                                key={"description"}
                                label={t("DESCRIPTION")}
                                name="description"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                isTextarea={true}
                                rows={4}
                                // placeholder="Enter district name"
                                touched={touched.description}
                                type="text"
                                value={values.description || ""}
                            />
                            <ModalFooter className='border-0'>
                                <Button disabled={isSubmitting ?? false} className="fs-14 fw-semibold" variant="outline-dark" onClick={toggle}>
                                    {t("CANCEL")}
                                </Button>
                                <Button type="submit" className="fs-14 fw-semibold" variant="warning" onClick={handleSubmit}>
                                    {t("SUBMIT")}
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    );
};

export default Add;
