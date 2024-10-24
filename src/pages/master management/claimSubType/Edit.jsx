import { Formik, Form } from "formik";
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { Button } from "react-bootstrap";
import toast from 'react-hot-toast';
import ReactSelect from "../../../components/ReactSelect";
import { validationSchema } from "../../../validations/claimSubType.validation";
import { useTranslation } from "react-i18next";
import { editClaimSubType } from "../../../services/claimSubType.service";


const Edit = ({ modal, toggle }) => {
    const {t} = useTranslation()
    const handleSubmit = async (values, actions) => {
        const formData = {
            name: "",
            claimType: "",
            SLABreachDay: "",
            description: "",
        }

        editClaimSubType(formData).then(response => {
            toast.success(response?.data?.message);
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
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>{t("EDIT CLAIM SUB TYPE")}</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        claimSubTypeName: "",
                        claimType: "",
                        SLABreachDay: "",
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
                                error={errors.claimSubTypeName}
                                id="claimSubTypeName"
                                key={"claimSubTypeName"}
                                label={t("NAME OF CLAIM SUB TYPE")}
                                name="claimSubTypeName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.claimSubTypeName}
                                type="text"
                                value={values.claimSubTypeName || ""}
                            />
                            <ReactSelect
                                error={errors?.claimType}
                                options={[{
                                    value: 1,
                                    label: 'Credit Portfolio'
                                },
                                {
                                    value: 2,
                                    label: 'Assets Acquired Through Payment'
                                }]}
                                value={values?.claimType}
                                onChange={(option) => { setFieldValue('claimType', option?.target?.value ?? '') }}
                                name="claimType"
                                label="Claim Type"
                                className={`${touched?.claimType && errors?.claimType ? "is-invalid" : ""} mb-3`}
                                onBlur={handleBlur}
                                touched={touched?.claimType}
                            />
                            <FormInput
                                error={errors.SLABreachDay}
                                id="SLABreachDay"
                                key={"SLABreachDay"}
                                label={t("SLA BREACH DAY")}
                                name="SLABreachDay"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.SLABreachDay}
                                type="number"
                                value={values?.SLABreachDay}
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
                                <Button className="fs-14 fw-semibold" variant="outline-dark" onClick={toggle}>
                                    {t("CANCEL")}
                                </Button>
                                <Button type="submit" disabled={isSubmitting ?? false} className="fs-14 fw-semibold" variant="warning" onClick={handleSubmit}>
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

export default Edit;
