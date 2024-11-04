import { Form as FormikForm, Formik } from "formik";
import React from "react";
import FormInput from "../../components/FormInput";
import { validationSchema } from "../../validations/rolerights.validation"; // Update to role rights validation schema
import { Button, Modal } from "react-bootstrap";
import Toggle from "../../components/Toggle";
import { handleAddRoleRight } from "../../services/rolerights.service"; // Update the import to include role rights service functions
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const RoleRightsModal = ({ modal, toggle }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const onSubmit = async (values) => {
    handleAddRoleRight(values)
      .then((response) => {
        toast.success(response.data.message);
        navigate("/role-rights");
      })
      .catch((error) => {
        toast.error(error.response.data.detail);
      });
  };

  return (
    <Modal
      show={modal}
      onHide={toggle}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      size="sm"
      className="theme-modal"
      enforceFocus={false}
    >
      <Modal.Header className="pb-3">
        <Modal.Title as="h4" className="fw-semibold">
          Add Role Right
        </Modal.Title>
      </Modal.Header>
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
            <Modal.Body className="text-break py-0">
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
            </Modal.Body>
            <Modal.Footer className="pt-0">
              <Button
                type="button"
                variant="outline-dark"
                onClick={toggle}
                className="custom-min-width-85"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="warning"
                className="custom-min-width-85"
                // onClick={handleSubmit}
              >
                {isEdit ? "Update" : "Submit"}
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default RoleRightsModal;
