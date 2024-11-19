import { Form, Formik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { validationSchema } from "../../../validations/provinceMaster.validation";
import { editProvinceMaster } from "../../../services/provinceMaster.service";

const Edit = ({ modal, toggle,rowData,dataQuery }) => {
  const { t } = useTranslation();
 
  const handleSubmit = async (values, actions) => {
    
    const formData = {
      name: values?.name
    };

    editProvinceMaster(rowData?.id , formData)
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
          {t("EDIT PROVINCE MASTER")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          name: rowData?.name,
        }}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
          handleSubmit(values, actions);
        }}
        validationSchema={validationSchema}
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
                error={errors?.name}
                id="name"
                key={"name"}
                label={t("NAME OF PROVINCE")}
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                touched={touched?.name}
                type="text"
                value={values?.name || ""}
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
