import { Form, Formik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import FormInput from "../../../components/FormInput";
import ReactSelect from "../../../components/ReactSelect";
import { editClaimSubType } from "../../../services/claimSubType.service";
import { validationSchema } from "../../../validations/claimSubType.validation";

const Edit = ({ modal, toggle }) => {
  const { t } = useTranslation();
  const handleSubmit = async (values, actions) => {
    const formData = {
      name: "",
      claimType: "",
      SLABreachDay: "",
      description: "",
    };

    editClaimSubType(formData)
      .then((response) => {
        toast.success(response?.data?.message);
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
          {t("EDIT CLAIM SUB TYPE")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          claimSubTypeName: "",
          claimType: "",
          SLABreachDay: "",
          description: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          actions.setSubmitting(true);
          handleSubmit(values, actions);
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          setFieldValue,
          values,
        }) => (
          <Form>
            <Modal.Body className="text-break py-0">
              <FormInput
                error={errors.claimSubTypeName}
                id="claimSubTypeName"
                key={"claimSubTypeName"}
                label={t("NAME OF CLAIM SUB TYPE")}
                name="claimSubTypeName"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched.claimSubTypeName}
                type="text"
                value={values.claimSubTypeName || ""}
              />
              <ReactSelect
                error={errors?.claimType}
                options={[
                  {
                    value: 1,
                    label: "Credit Portfolio",
                  },
                  {
                    value: 2,
                    label: "Assets Acquired Through Payment",
                  },
                ]}
                value={values?.claimType}
                onChange={(option) => {
                  setFieldValue("claimType", option?.target?.value ?? "");
                }}
                name="claimType"
                label="Claim Type"
                className={`${
                  touched?.claimType && errors?.claimType ? "is-invalid" : ""
                } mb-3`}
                onBlur={handleBlur}
                touched={touched?.claimType}
              />
              <FormInput
                error={errors.SLABreachDay}
                id="SLABreachDay"
                key={"SLABreachDay"}
                label={t("SLA BREACH DAY")}
                name="SLABreachDay"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched.SLABreachDay}
                type="number"
                value={values?.SLABreachDay}
              />
              <FormInput
                error={errors?.description}
                id="description"
                key={"description"}
                label={t("DESCRIPTION")}
                name="description"
                onBlur={handleBlur}
                onChange={handleChange}
                isTextarea={true}
                rows={4}
                // placeholder="Enter district name"
                touched={touched.description}
                type="text"
                value={values.description || ""}
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

export default Edit;
