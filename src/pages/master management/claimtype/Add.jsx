import { Form, Formik } from 'formik'
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { validationSchema } from '../../../validations/claimType.validation'; // CLAIM TYPE VALIDATION SCHEMA
import { Button } from "react-bootstrap";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createNewClaimType } from '../../../services/claimType.service';

const Add = ({ modal, toggle }) => {
    const {t} = useTranslation()

    const handleSubmit = async (values,actions) => {
        const formData = {
            name : values?.name,
            description : values?.description
        }

        createNewClaimType(formData).then(response => {
            toast.success(response?.data?.message);
            toggle()
        }).catch((error) => {
            if(error?.response?.data?.errorDescription){
                toast.error(error?.response?.data?.errorDescription);
            }else{
                toast.error(error?.message);
            }
        }).finally(()=>{
            actions.setSubmitting(false);
        });
    };


    return (
        <Modal className="district-modal-cover" isOpen={modal} toggle={toggle} centered >
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>{t("CREATE CLAIM TYPE")}</ModalHeader>
            <ModalBody>
                <Formik
                    initialValues={{
                        name: "",
                        description: ""
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, actions) => {
                        actions.setSubmitting(false);
                        handleSubmit(values, actions);
                    }}
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
                        isSubmitting
                    }) => (
                        <Form>
                            <FormInput
                                error={errors.claimTypeName}
                                id="name"
                                key={"name"}
                                label={t("NAME OF CLAIM TYPE")}
                                name="name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched?.name}
                                type="text"
                                value={values?.name || ""}
                            />
                            <FormInput
                                error={errors.description}
                                isTextarea={true}
                                id="description"
                                key={"description"}
                                label={t("DESCRIPTION")}
                                name="description"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched?.description}
                                rows={4}
                                type="text"
                                value={values?.description || ""}
                            />
                            <ModalFooter className='border-0'>
                                <Button className="fs-14 fw-semibold" variant="outline-dark" onClick={toggle}>
                                    {t("CANCEL")}
                                </Button>
                                <Button type="submit" isSubmitting ={false} onSubmit={handleSubmit} className="fs-14 fw-semibold" variant="warning">
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
