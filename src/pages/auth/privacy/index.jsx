import React from "react";
import { Button, Modal, Stack } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
import { FormSchema } from "./validations";
import CommonFormikComponent from "../../../components/CommonFormikComponent";

/**
 * Confirm Privacy Modal
 *
 * @param {{ handleShow: any; handleClose: any; }} param0
 * @param {*} param0.handleShow
 * @param {*} param0.handleClose
 * @returns {*}
 */

const PrivacyModal = ({ handleShow, handleClose }) => {
  // Initial Values
  const initialValues = {
    firstName: "",
  };

  // Handle Submit Handler
  const handleSubmit = (values, actions) => {
    actions.setSubmitting(false);
    console.log("values", values);
  };

  return (
    <Modal
      show={handleShow}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      size="lg"
      className="theme-modal"
      enforceFocus={false}
    >
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
              <FormInput
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
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                bibendum nibh vel volutpat condimentum. Nullam nec libero leo.
                Donec augue felis, varius viverra tortor non, dictum hendrerit
                purus. Cras aliquam id orci pharetra malesuada. enim elit
                volutpat velit, eu faucibus erat metus at diam. Integer vitae
                nisl et le eleifend mollis.
              </p>
              <p>
                Cras aliquam id orci pharetra malesuada. Aliquam nec mattis
                augue, art aliquam quam. In eget efficitur , sem facilisis veh
                vestibulum, enim elit volutpat velit, eu faucibus erat metus at
                diam. Integer vitae nisl et le eleifend aliquam quam. In eget
                efficitur , sem facilisis veh vestibulum, mollis.Lorem ipsum
                dolor sit amet, consectetur adipiscing elit. Sed bibendum nibh
                vel volutpat condimentum. Nullam nec libero leo. Donec augue
                felis, varius viverra tortor non, dictum hendrerit purus. Cras
                aliquam id orci pharetra malesuada. enim elit volutpat velit, eu
                faucibus erat metus at diam. Integer vitae nisl et le eleifend
                mollis.
              </p>
              <p>
                Cras aliquam id orci pharetra malesuada. Aliquam nec mattis
                augue, art aliquam quam. In eget efficitur , sem facilisis veh
                vestibulum, enim elit volutpat velit, eu faucibus erat metus at
                diam. Integer vitae nisl et le eleifend aliquam quam. In eget
                efficitur , sem facilisis veh vestibulum, mollis.Nullam nec
                libero leo. Donec augue felis, varius viverra tortor non, dictum
                hendrerit purus. Cras aliquam id orci pharetra malesuada. enim
                elit volutpat velit,
              </p>
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
    </Modal>
  );
};

export default PrivacyModal;
