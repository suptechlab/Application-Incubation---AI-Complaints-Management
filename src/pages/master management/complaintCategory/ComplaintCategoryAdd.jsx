import { Form as FormikForm, Formik } from "formik";
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { validationSchema } from '../../../validations/districts.validation'; // Update to district validation schema
import { Button } from "react-bootstrap";
import Toggle from '../../../components/Toggle';
import { handleAddDistrict } from "../../../services/district.service";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";


const ComplaintCategoryAdd = ({ modal, toggle }) => {
    const navigate = useNavigate();
    const onSubmit = async (values) => {
        console.log("values::", values);
        toast.success("Claim sub type added successfully.")

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
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>Create Complaint Category</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        claimTypeName_en: "",
                        claimTypeName_spa: "",
                        claimTypeDescription_en: "",
                        claimTypeDescription_spa: ""
                    }}
                    // validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({
                        errors,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        isSubmitting,
                        touched,
                        values,
                    }) => (
                        <FormikForm>

                            <FormInput
                                error={errors.districtName}
                                id="claimTypeName_en"
                                key={"claimTypeName_en"}
                                label="Name of Claim Type (English)"
                                name="claimTypeName_en"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.claimTypeName_en}
                                type="text"
                                value={values.claimTypeName_en || ""}
                            />
                            <FormInput
                                error={errors.districtName}
                                id="claimTypeName_spa"
                                key={"claimTypeName_spa"}
                                label="Name of Claim Type (Spanish)"
                                name="claimTypeName_spa"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.claimTypeName_en}
                                type="text"
                                value={values.claimTypeName_en || ""}
                            />

                        </FormikForm>
                    )}
                </Formik>
            </ModalBody>
            <ModalFooter className='border-0'>
                <Button className="fs-14 fw-semibold" variant="outline-dark" onClick={toggle}>
                    Cancel
                </Button>{' '}
                <Button className="fs-14 fw-semibold" variant="primary" onClick={onSubmit}>
                    Add
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ComplaintCategoryAdd;
