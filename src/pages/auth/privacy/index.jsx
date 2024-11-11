import React from "react";
import { Button, Modal, Stack } from "react-bootstrap";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormInputBox from "../../../components/FormInput";
import PrivacyData from "./privacyData";
import { FormSchema } from "./validations";

/**
 * Confirm Privacy Modal
 *
 * @param {{ handleClose: any; onSubmit: any; }} param0
 * @param {*} param0.handleClose
 * @param {*} param0.onSubmit
 * @returns {*}
 */

const PrivacyModal = ({ handleClose, onSubmit }) => {
  // Initial Values
  const initialValues = {
    firstName: "",
  };

  // Handle Submit Handler
  const handleSubmit = (values, actions) => {
    onSubmit(values, actions);
  };

  return (
    <React.Fragment>
      <Modal.Header closeButton>
        <Modal.Title as="h4" className="fw-bold">
          Your Privacy Matters
        </Modal.Title>
      </Modal.Header>

      <CommonFormikComponent
        validationSchema={FormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <React.Fragment>
            <Modal.Body className="text-break">
              <FormInputBox
                error={formikProps.errors.firstName}
                id="firstName"
                key={"firstName"}
                label="First Name *"
                name="firstName"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                placeholder="Enter first name"
                touched={formikProps.touched.firstName}
                type="text"
                value={formikProps.values.firstName || ""}
              />
              <PrivacyData />
            </Modal.Body>

            <Modal.Footer className="py-2">
              <Stack direction="horizontal" gap={3} className="flex-wrap py-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="custom-min-width-100"
                >
                  Decline
                </Button>
                <Button
                  type="submit"
                  variant="warning"
                  className="custom-min-width-100"
                >
                  Accept
                </Button>
              </Stack>
            </Modal.Footer>
          </React.Fragment>
        )}
      </CommonFormikComponent>
    </React.Fragment>
  );
};

export default PrivacyModal;
