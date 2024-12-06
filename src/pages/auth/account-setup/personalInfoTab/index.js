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
import { countryCodes } from "../../../../constants/CountryCodes";
import ReactSelect from "../../../../components/ReactSelect";
import { sendOTPonEmail, verifyRegisterOTP } from "../../../../redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

const PersonalInfoTab = ({ isSubmitted, setNewAccountData, isFormSubmitted, setIsFormSubmitted }) => {


  const dispatch = useDispatch()

  const { t } = useTranslation()

  const formattedCountryCodes = countryCodes.map(country => ({
    value: country?.value,
    label: country?.value
  }));


  const [isFormEmailValidate, setIsFormEmailValidate] = useState(false);

  const [optSendStatus, setOptSendStatus] = useState(false);

  const formikRef = useRef();

  // Initial Values
  const initialValues = {
    email: formikRef?.current?.values?.email || "",
    countryCode: formikRef?.current?.values?.countryCode || "",
    phoneNumber: formikRef?.current?.values?.phoneNumber || "",
    otpCode: "",
  };

  // Reusable function to send OTP
  const sendOTP = async (email) => {
    try {
      const result = await dispatch(sendOTPonEmail({ email }));
      if (sendOTPonEmail.fulfilled.match(result)) {
        toast.success(result?.payload?.message ?? "OTP Sent successfully.");
        return true;
      } else {
        console.error(result?.error?.message ?? "Failed to send OTP.");
        return false;
      }
    } catch (error) {
      console.error("SEND OTP ERROR:", error?.message);
      return false;
    }
  };

  // HANDLE SEND OTP ON REGISTER
  const handleSubmit = async (values, actions) => {
    actions.setSubmitting(true);
    const isOtpSent = await sendOTP(values?.email);
    if (isOtpSent) {
      setIsFormSubmitted(true);
      actions.setSubmitting(false);
    }

  };

  // Handle Resend OTP
  const handleResend = async (email) => {
    // THIS STATE IS FOR SPINNING RESNED OTP BUTTON
    setOptSendStatus(true);
    const isOtpSent = await sendOTP(email);
    if (isOtpSent) {
      setOptSendStatus(false);
      // toast.success("OTP has been resent successfully.");
    } else {
      setOptSendStatus(false);
    }
  };

  // HANDLE REGISTER OTP VERIFICATION
  const handleOtpSubmit = async (values, actions) => {
    actions.setSubmitting(true)
    try {
      const result = await dispatch(verifyRegisterOTP({ email: values?.email, otpCode: values?.otpCode }));
      if (verifyRegisterOTP?.fulfilled?.match(result)) {
        setNewAccountData((prev) => (
          {
            ...prev,
            email: values?.email,
            countryCode: values?.countryCode,
            phoneNumber: values?.phoneNumber,
            otpCode: values?.otpCode
          }))
        setIsFormSubmitted(false);
        setIsFormEmailValidate(true);
        isSubmitted(true)
        toast.success(result?.payload?.message ?? "OTP Verified.")
      } else {
        console.error(result?.error?.message);
      }
    } catch (error) {
      console.error("VERIFY OTP ERROR : ", error?.message)
    } finally {
      actions.setSubmitting(false)
    }


    // handleFormSubmit(values, actions);
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
              {t("PERSONAL_INFORMATION")}
            </h5>
            <AppTooltip title={t("PERSONAL_INFORMATION")}>
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
            <Col lg={2}>
              <ReactSelect
                label={t("COUNTRY_CODE")}
                error={formikProps.errors.countryCode}
                options={formattedCountryCodes ?? []}
                value={formikProps.values.countryCode}
                onChange={(option) => {
                  formikProps.setFieldValue(
                    "countryCode",
                    option?.target?.value ?? ""
                  );
                }}
                name="countryCode"
                className={formikProps.touched.countryCode && formikProps.errors.countryCode ? "is-invalid" : ""}
                onBlur={formikProps.handleBlur}
                touched={formikProps.touched.countryCode}
              />
            </Col>
            <Col lg={6}>
              <FormInputBox
                wrapperClassName="mb-4"
                autoComplete="off"
                id="phoneNumber"
                label={t("PHONE_NUMBER") + '*'}
                name="phoneNumber"
                type="number"
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
                  {t("EMAIL_VERIFICATION")}
                </h5>
                <AppTooltip title={t("EMAIL_VERIFICATION")}>
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
                      label={t("EMAIL_ADDRESS") + '*'}
                      name="email"
                      type="email"
                      error={formikProps.errors.email}
                      onBlur={formikProps.handleBlur}
                      onChange={formikProps.handleChange}
                      touched={formikProps.touched.email}
                      value={formikProps.values.email || ""}
                      readOnly={isFormEmailValidate ?? false}
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
                        disabled={formikProps?.isSubmitting ?? false}
                      >
                        {t("SEND_OTP_BUTTON")}
                      </Button>
                    </Col>
                  )}
                </Row>
              </Col>
            ) : (
              <Col xs={12}>
                <p className="mb-4 mt-n2">
                  {t("FORM_INSTRUCTION")}
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
                      disabled={formikProps?.isSubmitting ?? false}
                      className="custom-min-width-100 custom-margin-top-1"
                    >
                      {t("OTP_VERIFICATION")}
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <Button
                      type="button"
                      variant="link"
                      className="fw-semibold text-decoration-none p-0 border-0"
                      onClick={() => {
                        formikProps.setFieldValue("otpCode", "");
                        handleResend(formikProps?.values?.email)
                      }
                      }
                    >
                      <span className="me-1">
                        <MdRefresh
                          size={21}
                          className={optSendStatus ? "spin" : ""}
                        />
                      </span>{" "}
                      {t("RESEND_OTP")}
                    </Button>
                    <p className="pt-3 mb-0 fst-italic custom-font-size-12">
                      {t("OTP_INSTRUCTION")}
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
