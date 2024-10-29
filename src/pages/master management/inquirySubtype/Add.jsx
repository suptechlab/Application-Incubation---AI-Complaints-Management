import { Form, Formik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/ReactSelect";
import { validationSchema } from "../../../validations/inquirySubType.validation";

const Add = ({ modal, toggle }) => {
  const { t } = useTranslation();
  const handleSubmit = async (values) => {
    console.log("values::", values);
    toast.success("Inquiry sub type added successfully.");

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
          {t("CREATE SUB INQUIRY TYPE")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          inquirySubCategory: "",
          inquiryType: "",
          description: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
          handleSubmit(values, actions);
        }}
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
            <Modal.Body className="text-break py-0">
              <FormInput
                error={errors.inquirySubCategory}
                id="inquirySubCategory"
                key={"inquirySubCategory"}
                label={t("NAME OF INQUIRY SUB TYPE")}
                name="inquirySubCategory"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched.inquirySubCategory}
                type="text"
                value={values.inquirySubCategory || ""}
              />
              <ReactSelect
                error={errors?.inquiryType}
                options={[
                  {
                    value: 1,
                    label: "Corporate Governance",
                  },
                  {
                    value: 2,
                    label: "Non-Profit Organizations",
                  },
                ]}
                value={values?.inquiryType}
                onChange={(option) => {
                  setFieldValue("inquiryType", option?.target?.value ?? "");
                }}
                name="inquiryType"
                label={t("INQUIRY TYPE")}
                className={`${
                  touched?.inquiryType && errors?.inquiryType
                    ? "is-invalid"
                    : ""
                } mb-3`}
                onBlur={handleBlur}
                touched={touched?.inquiryType}
              />
              <FormInput
                error={errors.description}
                isTextarea={true}
                id="description"
                key={"description"}
                label={t("DESCRIPTION")}
                name="description"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched?.description}
                rows={4}
                type="text"
                value={values?.description || ""}
              />
            </Modal.Body>
            <Modal.Footer className="pt-0">
              <Button
                type="button"
                variant="outline-dark"
                onClick={toggle}
                className="custom-min-width-85"
              >
                {t("CANCEL")}
              </Button>
              <Button
                type="submit"
                variant="warning"
                className="custom-min-width-85"
                onClick={handleSubmit}
              >
                {t("SUBMIT")}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
export default Add;
