import { Form as FormikForm, Formik } from "formik";
import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormInput from '../../components/FormInput';
import { validationSchema } from '../../validations/rolerights.validation'; // Update to role rights validation schema
import { Button } from "react-bootstrap";
import Toggle from '../../components/Toggle';
import { handleAddRoleRight } from "../../services/rolerights.service"; // Update the import to include role rights service functions
import toast from 'react-hot-toast';
import { useNavigate, useParams } from "react-router-dom";

const RoleRightsModal = ({ modal, toggle }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    const onSubmit = async (values) => {
        handleAddRoleRight(values).then(response => {
            toast.success(response.data.message);
            navigate("/role-rights");
        }).catch((error) => {
            toast.error(error.response.data.detail);
        });
    };

    return (
        <Modal className="role-rights-modal-cover" isOpen={modal} toggle={toggle} centered>
            <ModalHeader className='border-0 fs-16 fw-semibold' toggle={toggle}>Add Role Right</ModalHeader>
            <ModalBody>
                <Formik
                    initialValues={{
                        roleName: "",
                        rights: true,
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
                                error={errors.roleName}
                                id="roleName"
                                key={"roleName"}
                                label="Role Name"
                                name="roleName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Enter role name"
                                touched={touched.roleName}
                                type="text"
                                value={values.roleName || ""}
                            />

                            <Toggle
                                id="rights"
                                key={"rights"}
                                label="Rights"
                                name="rights"
                                onChange={handleChange}
                                value={values.rights}
                            />
                            <div className="d-flex justify-content-end mt-3">
                                <Button variant="outline-dark" onClick={toggle} className="me-2">
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    {isEdit ? 'Update' : 'Submit'}
                                </Button>
                            </div>
                        </FormikForm>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    );
};

export default RoleRightsModal;
