import { Form, Formik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { validationSchema } from "../../../validations/provinceMaster.validation";

const Add = ({ modal, toggle }) => {
  const { t } = useTranslation();
  const handleSubmit = async (values) => {
    console.log("values::", values);
    toast.success("Province master added successfully.");

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
          {t("CREATE PROVINCE MASTER")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          provinceName: "",
          description: "",
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
                error={errors?.provinceName}
                id="provinceName"
                key={"provinceName"}
                label={t("NAME OF PROVINCE")}
                name="provinceName"
                onBlur={handleBlur}
                onChange={handleChange}
                touched={touched?.provinceName}
                type="text"
                value={values?.provinceName || ""}
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
