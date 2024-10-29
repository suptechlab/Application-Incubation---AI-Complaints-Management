import { Formik, Form as FormikForm } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import Toggle from "../../components/Toggle";
import { handleAddState } from "../../services/state.service";
import { validationSchema } from "../../validations/states.validation";

const StateModal = ({ modal, toggle }) => {
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    console.log("values::", values);
    handleAddState(values)
      .then((response) => {
        console.log("Add State::", response);
        toast.success(response.data.message);
        navigate("/states");
      })
      .catch((error) => {
        if (error.response.data.fieldErrors) {
          toast.error(error.response.data.fieldErrors[0].message);
        } else {
          toast.error(error.response.data.detail);
        }
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
          Add State
        </Modal.Title>
      </Modal.Header>
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
            <Modal.Body className="text-break py-0">
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
                Add
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default StateModal;
