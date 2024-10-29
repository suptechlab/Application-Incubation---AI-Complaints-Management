import { Form, Formik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
import { validationSchema } from "../../../validations/claimType.validation"; // CLAIM TYPE VALIDATION SCHEMA
// import { handleAddDistrict } from "../../../services/district.service";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { createNewClaimType } from "../../../services/claimType.service";

const Add = ({ modal, toggle, dataQuery }) => {
  const { t } = useTranslation();

  const handleSubmit = async (values, actions) => {
    const formData = {
      name: values?.name,
      description: values?.description,
    };

    createNewClaimType(formData)
      .then((response) => {
        toast.success(response?.data?.message);
        dataQuery.refetch();
        toggle();
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
          {t("CREATE CLAIM TYPE")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          name: "",
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
          isSubmitting,
        }) => (
          <Form>
            <Modal.Body className="text-break py-0">
              <FormInput
                error={errors?.name}
                id="name"
                key={"name"}
                label={t("NAME OF CLAIM TYPE")}
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched?.name}
                type="text"
                value={values?.name || ""}
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
