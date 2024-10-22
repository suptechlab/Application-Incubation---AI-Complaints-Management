import { Form, Formik } from 'formik'
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { validationSchema } from '../../../validations/claimType.validation'; // CLAIM TYPE VALIDATION SCHEMA
import { Button } from "react-bootstrap";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from 'react-hot-toast';

const Add = ({ modal, toggle }) => {
    const handleSubmit = async (values) => {
        console.log("values::", values);
        toast.success("Claim type added successfully.")

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
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>Create Claim Type</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        claimTypeName: "",
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
                    }) => (
                        <Form>
                            <FormInput
                                error={errors.claimTypeName}
                                id="claimTypeName"
                                key={"claimTypeName"}
                                label="Name of Claim Type"
                                name="claimTypeName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.claimTypeName}
                                type="text"
                                value={values.claimTypeName || ""}
                            />
                            <FormInput
                                error={errors.description}
                                isTextarea={true}
                                id="description"
                                key={"description"}
                                label="Description"
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
                                    Cancel
                                </Button>{' '}
                                <Button type="submit" onSubmit={handleSubmit} className="fs-14 fw-semibold" variant="warning">
                                    Submit
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
