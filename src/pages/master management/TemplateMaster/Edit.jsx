import { Formik, Form as FormikForm } from "formik";
import React, { Fragment, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SunEditorReact from "../../../components/SuneditorReact";
import { validationSchema } from "../../../validations/templateMaster.validation";
import ReactSelect from "../../../components/ReactSelect";

import {
  editTemplateMaster,
  getTemplateMaster,
} from "../../../services/templateMaster.service";
import Loader from "../../../components/Loader";

const Edit = ({ provinces, modal, toggle }) => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [templateTypeOption, setTemplateTypeOption] = useState([
    { value: "EMAIL ", label: t('EMAIL') },
    { value: "EMAIL ", label: t('NOTIFICATION') }
  ])
  const [initialValues, setInitialValues] = useState({
          templateName: "",
          subject: "",
          content: "",
          templateType: "",
  });

  useEffect(() => {
    getTemplateMaster()
    .then((response) => {
      setInitialValues({
          templateName: response.data?.templateName ?? "",
          subject: response.data?.subject ?? "",
          content: response.data?.content ?? "",
          templateType: response.data?.templateType ?? "", 
      });
      setLoading(false);
    })
    .catch((error) => {
        console.error("Error get during to fetch", error);
    }); 
  });

  const onSubmit = async (values, actions) => {
    console.log("values::", values);
    //toast.success("Template master added successfully.");

    editTemplateMaster(values).then(response => {
      toast.success(response.data.message);
      navigate("/template-master");
    }).catch((error) => {
      console.log('error', error)
      toast.error(error);
    });
  };

  return (
    <Fragment>
    <Loader isLoading={loading} />
    <Modal
      show={modal}
      onHide={toggle}
      backdrop="static"
      keyboard={false}
      centered={true}
      scrollable={true}
      className="theme-modal"
      enforceFocus={false}
    >
      <Modal.Header className="pb-3">
        <Modal.Title as="h4" className="fw-semibold">
          {t("CREATE TEMPLATE MASTER")}
        </Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={initialValues}
        // onSubmit={(values, actions) => {
        //   actions.setSubmitting(false); // Stops the loading spinner in Formik
        //   handleSubmit(values, actions); // Calls the submit handler
        // }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          setFieldValue,
          touched,
          errors,
        }) => (
          <FormikForm
                  onSubmit={handleSubmit}
                  className="d-flex flex-column h-100"
                >
            <Modal.Body className="text-break py-0">
              <ReactSelect
                error={errors?.templateType}
                options={templateTypeOption ?? []}
                value={values.templateType}
                onChange={(option) => {
                    setFieldValue('templateType', option.target.value);
                }}
                name="templateType"
                label={t("PROVINCE")}
                className={`${touched?.templateType && errors?.templateType ? "is-invalid" : ""
                  } mb-3 pb-1`}
                onBlur={handleBlur}
                touched={touched?.templateType}
              />
              <FormInput
                error={errors.templateName}
                id="templateName"
                key={"templateName"}
                label={t("NAME OF TEMPLATE MASTER")}
                name="templateName"
                onBlur={handleBlur}
                onChange={handleChange}
                touched={touched.templateName}
                type="text"
                value={values.templateName || ""}
              />
              <FormInput
                error={errors.subject}
                id="subject"
                key={"subject"}
                label={t("NAME OF TEMPLATE MASTER")}
                name="subject"
                onBlur={handleBlur}
                onChange={handleChange}
                touched={touched.subject}
                type="text"
                value={values.subject || ""}
              />
              <SunEditorReact
                id="content"
                name="content"
                label="Template Details *"
                content={values.content}
                error={errors?.content}
                touched={touched?.content}
                handleBlur={handleBlur}
                handleChange={(value) => {
                  setFieldValue("content", value === "<p><br></p>" ? "" : value);
                }}
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
                type="submit" // This ensures Formik handles the submission
                variant="warning"
                className="custom-min-width-85"
              >
                {t("SUBMIT")}
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>

    </Modal>
    </Fragment>
  );
};

export default Edit;
