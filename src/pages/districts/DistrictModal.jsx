import { Form as FormikForm, Formik } from "formik";
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../components/FormInput';
import { validationSchema } from '../../validations/districts.validation'; // Update to district validation schema
import { Button } from "react-bootstrap";
import Toggle from '../../components/Toggle';
import { handleAddDistrict } from "../../services/district.service";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";


const DistrictModal = ({ modal, toggle }) => {
    const navigate = useNavigate();
    const onSubmit = async (values) => {
        console.log("values::", values);
        handleAddDistrict(values).then(response => {
            console.log("Add District::", response);
            toast.success(response.data.message);
            navigate("/districts");
        }).catch((error) => {
            if(error.response.data.fieldErrors){
                toast.error(error.response.data.fieldErrors[0].message);
            }else{
                toast.error(error.response.data.detail);
            }
        });
    };

    return (
        <Modal className="district-modal-cover" isOpen={modal} toggle={toggle} centered >
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={toggle}>Add District</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        districtName: "",
                        status: true,
                    }}
                    validationSchema={validationSchema}
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
                                id="districtName"
                                key={"districtName"}
                                label="District Name"
                                name="districtName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Enter district name"
                                touched={touched.districtName}
                                type="text"
                                value={values.districtName || ""}
                            />

                            <Toggle
                                id="status"
                                key={"status"}
                                label="Status"
                                name="status"
                                onChange={handleChange}
                                value={values.status}
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

export default DistrictModal;
