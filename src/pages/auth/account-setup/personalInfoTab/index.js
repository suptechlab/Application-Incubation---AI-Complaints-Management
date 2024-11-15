import React, { useRef, useState } from "react";
import { Button, Col, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { FiInfo } from "react-icons/fi";
import { MdRefresh } from "react-icons/md";
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormInputBox from "../../../../components/FormInput";
import FormOtpInputBox from "../../../../components/formOtpInput";
import SvgIcons from "../../../../components/SVGIcons";
import AppTooltip from "../../../../components/tooltip";
import { OtpFormSchema, PersonalInfoTabSchema } from "../../validations";

const PersonalInfoTab = ({ handleFormSubmit }) => {
  const [isFormEmailValidate, setIsFormEmailValidate] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [optSendStatus, setOptSendStatus] = useState(false);

  const formikRef = useRef();

  // Initial Values
  const initialValues = {
    email: formikRef?.current?.values?.email || "",
    phoneNumber: formikRef?.current?.values?.phoneNumber || "",
    otpCode: "",
  };

  // Handle Submit Handler
  const handleSubmit = (values, actions) => {
    setIsFormSubmitted(true);
  };

  // Handle OTP Submit Handler
  const handleOtpSubmit = (values, actions) => {
    console.log("CALLING OTP SUBMIT HERE")
    setIsFormSubmitted(false);
    setIsFormEmailValidate(true);
    handleFormSubmit(values, actions);
  };

  // Handle Resend OTP
  const handleResend = () => {
    setOptSendStatus(true);
    try {
      setOptSendStatus(false);
      toast.success("OTP has been resent successfully.");
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
      setOptSendStatus(false);
    }
  };

  return (
    <CommonFormikComponent
      validationSchema={isFormSubmitted ? OtpFormSchema : PersonalInfoTabSchema}
      initialValues={initialValues}
      onSubmit={isFormSubmitted ? handleOtpSubmit : handleSubmit}
      innerRef={formikRef}
    >
      {(formikProps) => (
        <React.Fragment>
          <Stack direction="horizontal" gap={2} className="mb-3 flex-wrap">
            <h5 className="custom-font-size-18 mb-0 fw-bold">
              Personal Information
            </h5>
            <AppTooltip title="Personal Information Tooltip Data">
              <Button
                type="button"
                variant="link"
                className="p-0 border-0 link-dark"
              >
                <FiInfo size={22} />
              </Button>
            </AppTooltip>
          </Stack>
          <Row>
            <Col lg={6}>
              <FormInputBox
                wrapperClassName="mb-4"
                autoComplete="off"
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                type="text"
                error={formikProps.errors.phoneNumber}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                touched={formikProps.touched.phoneNumber}
                value={formikProps.values.phoneNumber || ""}
              />
            </Col>
            <Col xs={12}>
              <Stack direction="horizontal" gap={2} className="mb-3 flex-wrap">
                <h5 className="custom-font-size-18 mb-0 fw-bold">
                  Email Verification
                </h5>
                <AppTooltip title="Email Verification Tooltip Data">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 border-0 link-dark"
                  >
                    <FiInfo size={22} />
                  </Button>
                </AppTooltip>
              </Stack>
            </Col>
            {!isFormSubmitted ? (
              <Col xs={12}>
                <Row>
                  <Col sm lg={6}>
                    <FormInputBox
                      autoComplete="off"
                      id="email"
                      label="Email Address"
                      name="email"
                      type="email"
                      error={formikProps.errors.email}
                      onBlur={formikProps.handleBlur}
                      onChange={formikProps.handleChange}
                      touched={formikProps.touched.email}
                      value={formikProps.values.email || ""}
                      inputIcon={
                        isFormEmailValidate && (
                          <span className="text-success position-absolute top-0 end-0 p-1 custom-width-42 h-100 d-inline-flex align-items-center justify-content-center pe-none user-select-none">
                            {SvgIcons.checkBadgeIcon}
                          </span>
                        )
                      }
                      inputClassName={
                        isFormEmailValidate && "custom-padding-right-42"
                      }
                    />
                  </Col>
                  {!isFormEmailValidate && (
                    <Col xs="auto" lg className="pt-sm-4 mb-3 pb-1">
                      <Button
                        type="submit"
                        variant="warning"
                        className="custom-min-width-100 custom-margin-top-1"
                      >
                        Send OTP
                      </Button>
                    </Col>
                  )}
                </Row>
              </Col>
            ) : (
              <Col xs={12}>
                <p className="mb-4 mt-n2">
                  Fill the below form to create your account then you will be
                  redirected to file a claim.
                </p>
                <Row>
                  <Col sm lg={6}>
                    <FormOtpInputBox
                      value={formikProps.values.otpCode}
                      numInputs={6}
                      inputStyle={{
                        width: "50px",
                        height: "42px",
                      }}
                      onChange={(event) => {
                        formikProps.setFieldValue("otpCode", event);
                      }}
                      onBlur={formikProps.handleBlur}
                      error={formikProps.errors.otpCode}
                      touched={formikProps.touched.otpCode}
                    />
                  </Col>
                  <Col xs className="mb-3 pb-1">
                    <Button
                      type="submit"
                      variant="warning"
                      className="custom-min-width-100 custom-margin-top-1"
                    >
                      Verify OTP
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <Button
                      type="button"
                      variant="link"
                      className="fw-semibold text-decoration-none p-0 border-0"
                      onClick={handleResend}
                    >
                      <span className="me-1">
                        <MdRefresh
                          size={21}
                          className={optSendStatus ? "spin" : ""}
                        />
                      </span>{" "}
                      Resend OTP
                    </Button>
                    <p className="pt-3 mb-0 fst-italic custom-font-size-12">
                      Didn't receive the OTP? Check your spam folder or click
                      "Resend OTP" to get a new code.
                    </p>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        </React.Fragment>
      )}
    </CommonFormikComponent>
  );
};

export default PersonalInfoTab;
