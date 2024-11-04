import { Form, Formik } from "formik";
import React from "react";
import FormInput from "../../../components/FormInput";
import { Button, Modal } from "react-bootstrap";
// import { handleAddDistrict } from "../../../services/district.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ReactSelect from "../../../components/ReactSelect";
import { validationSchema } from "../../../validations/cityMaster.validation";
import { useTranslation } from "react-i18next";

const Edit = ({ modal, toggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    console.log("values::", values);
    toast.success("City master added successfully.");

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
          {t("EDIT CITY MASTER")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          cityName: "",
          province: "",
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
                error={errors.cityName}
                id="cityName"
                key={"cityName"}
                label={t("NAME OF THE CITY")}
                name="cityName"
                onBlur={handleBlur}
                onChange={handleChange}
                // placeholder="Enter district name"
                touched={touched.cityName}
                type="text"
                value={values.cityName || ""}
              />
              <ReactSelect
                error={errors?.province}
                options={[
                  {
                    value: 1,
                    label: "Azuay",
                  },
                  {
                    value: 2,
                    label: "Bolivar",
                  },
                ]}
                value={values?.province}
                onChange={(option) => {
                  setFieldValue("province", option?.target?.value ?? "");
                }}
                name="province"
                label={t("PROVINCE")}
                className={`${
                  touched?.province && errors?.province ? "is-invalid" : ""
                } mb-3 pb-1`}
                onBlur={handleBlur}
                touched={touched?.province}
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
