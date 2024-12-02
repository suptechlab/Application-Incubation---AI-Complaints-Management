import { Formik, Form as FormikForm } from "formik";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../../components/FormInput";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SunEditorReact from "../../../components/SuneditorReact";
import { validationSchema } from "../../../validations/templateMaster.validation";
import ReactSelect from "../../../components/ReactSelect";

import {
  createNewTemplateMaster,
  editTemplateMaster,
  getTemplateMaster,
} from "../../../services/templateMaster.service";
import Loader from "../../../components/Loader";

const Add = ({ provinces, modal, toggle, dataQuery }) => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [templateTypeOption, setTemplateTypeOption] = useState([
    { value: "EMAIL", label: t('EMAIL') },
    { value: "NOTIFICATION", label: t('NOTIFICATION') }
  ])

  const onSubmit = async (values, actions) => {
    setLoading(true);
    createNewTemplateMaster(values).then(response => {
      toast.success(response.data.message);
      toggle();
      setLoading(false);
      dataQuery.refetch()
    }).catch((error) => {
      setLoading(false);
      console.log('error', error)
      toast.error(error);
    });
  };

  return (
    <React.Fragment>
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
          initialValues={{
            templateName: "",
            subject: "",
            content: "",
            templateType: "",
          }}
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
                  label={t("TEMPLATE TYPE*")}
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
                  label={t("SUBJECT")}
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
                  label={t("TEMPLATE_DETAILS")}
                  height="215"
                  content={values.description}
                  error={errors?.description}
                  touched={touched?.description}
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
    </React.Fragment>
  );
};

export default Add;
