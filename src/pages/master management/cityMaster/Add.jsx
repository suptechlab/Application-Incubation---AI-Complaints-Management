import { Form, Formik } from 'formik'
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../../components/FormInput';
import { Button } from "react-bootstrap";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import ReactSelect from '../../../components/ReactSelect';
import { validationSchema } from '../../../validations/cityMaster.validation';


const Add = ({ modal, toggle }) => {
    const navigate = useNavigate();
    const handleSubmit = async (values) => {
        console.log("values::", values);
        toast.success("City master added successfully.")

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
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={null}>Create City Master</ModalHeader>
            <ModalBody >
                <Formik
                    initialValues={{
                        cityName: "",
                        province: ""
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
                                error={errors.cityName}
                                id="cityName"
                                key={"cityName"}
                                label="Name of the City"
                                name="cityName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                // placeholder="Enter district name"
                                touched={touched.cityName}
                                type="text"
                                value={values.cityName || ""}
                            />
                            <ReactSelect
                                error={errors?.province}
                                options={[{
                                    value: 1,
                                    label: 'Azuay'
                                },
                                {
                                    value: 2,
                                    label: 'Bolivar'
                                }]}
                                value={values?.province}
                                onChange={(option) => { setFieldValue('province', option?.target?.value ?? '') }}
                                name="province"
                                label="Province"
                                className={`${touched?.province && errors?.province ? "is-invalid" : ""} mb-3`}
                                onBlur={handleBlur}
                                touched={touched?.province}
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
