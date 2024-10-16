import { Form as FormikForm, Formik } from "formik";
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../components/FormInput';
import { validationSchema } from '../../validations/states.validation';
import { Button } from "react-bootstrap";
import Toggle  from '../../components/Toggle';
import { handleAddState } from "../../services/state.service";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";


const StateModal = ({ modal, toggle }) => {
    const navigate = useNavigate()
    const onSubmit = async (values) => {
        console.log("values::", values);
        handleAddState(values).then(response=>{
            console.log("Add State::", response);
            toast.success(response.data.message);
            navigate("/states");

        }).catch((error) => {
            if(error.response.data.fieldErrors){
                toast.error(error.response.data.fieldErrors[0].message);
            }else{
                toast.error(error.response.data.detail);
            }
        })
    }

    return (
        <Modal className="state-modal-cover" isOpen={modal} toggle={toggle} centered >
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={toggle}>Add State</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        stateName: "",
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
                                error={errors.stateName}
                                id="stateName"
                                key={"stateName"}
                                label="State Name"
                                name="stateName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Enter state name"
                                touched={touched.stateName}
                                type="text"
                                value={values.stateName || ""}
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

export default StateModal;
