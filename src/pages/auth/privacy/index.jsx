import React from "react";
import { Button, Modal, Stack } from "react-bootstrap";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormCheckbox from "../../../components/formCheckbox";
import { PrivacyFormSchema } from "../../helpdesk/validations";
import PrivacyData from "./privacyData";

/**
 * Confirm Privacy Modal
 *
 * @param {{ handleClose: any; }} param0
 * @param {*} param0.handleClose
 * @returns {*}
 */

const PrivacyModal = ({ handleClose, handleFormSubmit }) => {
  // Initial Values
  const initialValues = {
    agreePrivacy: false,
  };

  // Handle Submit Handler
  const handleSubmit = (values, actions) => {
    handleFormSubmit(values, actions);
  };

  return (
    <React.Fragment>
      <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">
        <Modal.Title as="h4" className="fw-bold pt-1">
          Your Privacy Matters
        </Modal.Title>
      </Modal.Header>

      <CommonFormikComponent
        validationSchema={PrivacyFormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <React.Fragment>
            <Modal.Body className="text-break d-flex flex-column small p-0">
              <div className='chatbot-body d-flex flex-column flex-grow-1 overflow-auto px-4'>
                <div className='chatbot-body-inner flex-grow-1 overflow-auto mx-n4 px-4'>
                  <PrivacyData />
                </div>
                <div className='pt-2'>
                  <FormCheckbox
                    wrapperClassName="mb-0"
                    className='fs-6 fw-semibold'
                    id="agreePrivacy"
                    checked={formikProps.values.agreePrivacy}
                    onBlur={formikProps.handleBlur}
                    onChange={formikProps.handleChange}
                    touched={formikProps.touched.agreePrivacy}
                    error={formikProps.errors.agreePrivacy}
                    type="checkbox"
                    label="I agreed to the data protection and privacy terms"
                  />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="pt-0">
              <Stack direction="horizontal" gap={3} className="flex-wrap pt-0">
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
