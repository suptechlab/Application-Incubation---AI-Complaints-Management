import { Formik, Form } from "formik";
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { validationSchema } from '../../../validations/districts.validation'; // Update to district validation schema
import { Button } from "react-bootstrap";
import Toggle from '../../../components/Toggle';
import { handleAddDistrict } from "../../../services/district.service";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import ReactSelect from "../../../components/ReactSelect";


const Edit = ({ modal, toggle }) => {
    const navigate = useNavigate();
    const handleSubmit = async (values) => {
        console.log("values::", values);
        toast.success("Claim sub type updated successfully.")

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
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>Edit Claim Sub Type</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        claimSubTypeName: "",
                        claimType: "",
                        SLABreachDay: "",
                        description: "",
                    }}
                    // validationSchema={validationSchema}
                    onSubmit={(values, actions) => {
                        actions.setSubmitting(false);
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
                                label="Name of Claim Type"
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
                                label="SLA Breach Days"
                                name="SLABreachDay"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.SLABreachDay}
                                type="text"
                                value={values.SLABreachDay || ""}
                            />
                            <FormInput
                                error={errors?.description}
                                id="description"
                                key={"description"}
                                label="Description"
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
                                    Cancel
                                </Button>
                                <Button type="submit" className="fs-14 fw-semibold" variant="warning" onClick={handleSubmit}>
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

export default Edit;
