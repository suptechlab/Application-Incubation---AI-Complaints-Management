import { Form, Formik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/ReactSelect";
import { validationSchema } from "../../../validations/inquirySubType.validation";
import { editInquirySubType } from "../../../services/inquirySubType.service";

const Edit = ({ modal, toggle, rowData, dataQuery, inquiryTypes }) => {

  const { t } = useTranslation();
  const handleSubmit = async (values, actions) => {
    const formData = {
      name: values?.name,
      description: values?.description,
      inquiryTypeId: values?.inquiryTypeId
    };

    editInquirySubType(rowData?.id, formData)
      .then((response) => {
        toast.success(response?.data?.message);
        toggle();
        dataQuery.refetch()
      })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      })
      .finally(() => {
        actions.setSubmitting(false);
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
          {t("EDIT SUB INQUIRY TYPE")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          name: rowData?.name ?? "",
          description: rowData?.description ?? "",
          inquiryTypeId: rowData?.inquiryTypeId ?? null
        }}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          actions.setSubmitting(true);
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
          isSubmitting
        }) => (
          <Form>
            <Modal.Body className="text-break py-0">
              <FormInput
                error={errors?.name}
                id="name"
                key={"name"}
                label={t("NAME OF INQUIRY SUB TYPE")}
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched?.name}
                type="text"
                value={values?.name || ""}
              />

              <ReactSelect
                error={errors?.inquiryTypeId}
                options={inquiryTypes ?? []}
                value={values?.inquiryTypeId}
                onChange={(option) => {
                  setFieldValue("inquiryTypeId", option?.target?.value ?? "");
                }}
                name="inquiryTypeId"
                label={t("INQUIRY TYPE")}
                className={`${touched?.inquiryTypeId && errors?.inquiryTypeId
                  ? "is-invalid"
                  : ""
                  } mb-3`}
                onBlur={handleBlur}
                touched={touched?.inquiryTypeId}
              />
              <FormInput
                error={errors?.description}
                isTextarea={true}
                id="description"
                key={"description"}
                label={t("DESCRIPTION")}
                name="description"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched?.description}
                rows={5}
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
                disabled={isSubmitting ?? false}
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

export default Edit;
