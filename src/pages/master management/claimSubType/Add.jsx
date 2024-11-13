import { Form, Formik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import FormInput from "../../../components/FormInput";
import ReactSelect from "../../../components/ReactSelect";
import { createNewClaimSubType } from "../../../services/claimSubType.service";
import { validationSchema } from "../../../validations/claimSubType.validation";

const Add = ({ modal, toggle ,dataQuery , claimTypes}) => {
  console.log('claimTypes',claimTypes)
  const { t } = useTranslation();
 
  const handleSubmit = async (values, actions) => {
    const formData = {
      name: values?.name ?? "",
      claimTypeId: values?.claimTypeId ?? null,
      slaBreachDays: values?.slaBreachDays ?? null,
      description: values?.description ?? "",
    }

    createNewClaimSubType(formData).then(response => {
      toast.success(response?.data?.message);
      dataQuery.refetch()
      toggle()
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message);
      }
    }).finally(() => {
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
         {t("CREATE CLAIM SUB TYPE")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          name: "",
          claimTypeId: "",
          slaBreachDays: 15,
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
                error={errors?.name}
                id="name"
                key={"name"}
                label={t("SUB-CLAIM")}
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                touched={touched?.name}
                type="text"
                value={values?.name || ""}
              />
              <ReactSelect
                error={errors?.claimTypeId}
                options={claimTypes ?? []}
                value={values?.claimTypeId}
                onChange={(option) => {
                  setFieldValue("claimTypeId", option?.target?.value ?? "");
                }}
                name="claimTypeId"
                label="Claim Type"
                className={`${
                  touched?.claimTypeId && errors?.claimTypeId ? "is-invalid" : ""
                } mb-3`}
                onBlur={handleBlur}
                touched={touched?.claimTypeId}
              />
              <FormInput
                error={errors?.slaBreachDays}
                id="slaBreachDays"
                key={"slaBreachDays"}
                label={t("SLA BREACH DAY")}
                name="slaBreachDays"
                onBlur={handleBlur}
                onChange={handleChange}
                touched={touched?.slaBreachDays}
                type="number"
                value={values?.slaBreachDays}
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
                rows={5}
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
                disabled={isSubmitting ?? false}
              >
                {t("CANCEL")}
              </Button>
              <Button
                type="submit"
                variant="warning"
                className="custom-min-width-85"
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
