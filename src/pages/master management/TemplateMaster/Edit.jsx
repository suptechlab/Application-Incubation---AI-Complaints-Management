import { Form, Formik } from 'formik'
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { Button } from "react-bootstrap";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { validationSchema } from '../../../validations/templateMaster.validation';
import { useTranslation } from 'react-i18next';


const Edit = ({ modal, toggle }) => {
    const {t} = useTranslation()
    const navigate = useNavigate();
    const handleSubmit = async (values) => {
        console.log("values::", values);
        toast.success("Template master updated successfully.")

        // handleAddDistrict(values).then(response => {
        //     console.log("Add District::", response);
        //     toast.success(response.data.message);
        //     navigate("/districts");
        // }).catch((error) => {
        //     if(error.response.data.fieldErrors){
        //         toast.error(error.response.data.fieldErrors[0].message);
        //     }else{
        //         toast.error(error.response.data.detail);
        //     }
        // });
    };

    return (
        <Modal className="district-modal-cover" isOpen={modal} toggle={toggle} centered >
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>{t("EDIT TEMPLATE MASTER")}</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        templateName: ""
                    }}
                    onSubmit={(values, actions) => {
                        actions.setSubmitting(false);
                        handleSubmit(values, actions);
                    }}
                    validationSchema={validationSchema}
                >
                    {({
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
                            <FormInput
                                error={errors.templateName}
                                id="templateName"
                                key={"templateName"}
                                label={t("NAME OF TEMPLATE MASTER")}
                                name="templateName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.templateName}
                                type="text"
                                value={values.templateName || ""}
                            />
                            <ModalFooter className='border-0'>
                                <Button className="fs-14 fw-semibold" variant="outline-dark" onClick={toggle}>
                                    {t("CANCEL")}
                                </Button>{' '}
                                <Button type="submit" onSubmit={handleSubmit} className="fs-14 fw-semibold" variant="warning">
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
