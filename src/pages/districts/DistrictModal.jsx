import { Form as FormikForm, Formik } from "formik";
import React from "react";
import FormInput from "../../components/FormInput";
import { validationSchema } from "../../validations/districts.validation"; // Update to district validation schema
import { Button, Modal } from "react-bootstrap";
import Toggle from "../../components/Toggle";
import { handleAddDistrict } from "../../services/district.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DistrictModal = ({ modal, toggle }) => {
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    console.log("values::", values);
    handleAddDistrict(values)
      .then((response) => {
        console.log("Add District::", response);
        toast.success(response.data.message);
        navigate("/districts");
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
          Add District
        </Modal.Title>
      </Modal.Header>

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
            <Modal.Body className="text-break py-0">
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
                onClick={onSubmit}
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

export default DistrictModal;
