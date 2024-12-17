import { Formik, Form as FormikForm } from "formik";
import React, { Fragment, useEffect, useState } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import FormInput from "../../../../components/FormInput";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import SunEditorReact from "../../../../components/SuneditorReact";
import { validationSchema } from "../../../../validations/templateMaster.validation";
import ReactSelect from "../../../../components/ReactSelect";

import {
  editTemplateMaster,
  getTemplateMaster,
} from "../../../../services/templateMaster.service";
import Loader from "../../../../components/Loader";
import PageHeader from "../../../../components/PageHeader";

const EditTemplate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [templateTypeOption, setTemplateTypeOption] = useState([
    { value: "EMAIL", label: t('EMAIL') },
    { value: "NOTIFICATION", label: t('NOTIFICATION') }
  ])


  const {id} = useParams()


  const [initialValues , setInitialValues] = useState({})

  useEffect(() => {

    if (id) {
      setLoading(true);
      getTemplateMaster(id)
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
    }
  }, [id]);

  const onSubmit = async (values, actions) => {
    setLoading(true);
    editTemplateMaster(id, values).then(response => {
      setLoading(false);
      toast.success(response.data.message);
      actions.setSubmitting(false)
    }).catch((error) => {
      // console.log('error', error)
      toast.error(error?.response?.data?.errorDescription ?? error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };
  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">

        <PageHeader
          title={t("EDIT TEMPLATE MASTER")}
        // actions={[
        //   { label: "Export to CSV", onClick: exportHandler, variant: "outline-dark", disabled: isDownloading ?? false },
        //   { label: "Add New", onClick: toggle, variant: "warning" },
        // ]}
        />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <Formik
              initialValues={initialValues}
              enableReinitialize={true}
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
                      value={values?.templateType}
                      onChange={(option) => {
                        setFieldValue('templateType', option?.target?.value ?? "");
                      }}
                      name="templateType"
                      label={t("TEMPLATE TYPE*")}
                      className={`${touched?.templateType && errors?.templateType ? "is-invalid" : ""
                        } mb-3 pb-1`}
                      onBlur={handleBlur}
                      touched={touched?.templateType}
                    />
                    <FormInput
                      error={errors?.templateName}
                      id="templateName"
                      key={"templateName"}
                      label={t("NAME OF TEMPLATE MASTER")}
                      name="templateName"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      touched={touched?.templateName}
                      type="text"
                      value={values?.templateName || ""}
                    />
                    <FormInput
                      error={errors?.subject}
                      id="subject"
                      key={"subject"}
                      label={t("SUBJECT")}
                      name="subject"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      touched={touched?.subject}
                      type="text"
                      value={values?.subject || ""}
                    />
                    <SunEditorReact
                      id="content"
                      name="content"
                      label={t("TEMPLATE_DETAILS")}
                      content={values?.content}
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
                      // onClick={toggle}
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
          </Card.Body>
        </Card>
      </div>
    </React.Fragment>);
};

export default EditTemplate;
