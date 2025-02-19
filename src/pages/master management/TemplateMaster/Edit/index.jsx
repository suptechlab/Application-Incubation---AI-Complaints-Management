import { Formik, Form as FormikForm } from "formik";
import React, { Fragment, useEffect, useState } from "react";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
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
  templateKeywordListing,
} from "../../../../services/templateMaster.service";
import Loader from "../../../../components/Loader";
import PageHeader from "../../../../components/PageHeader";
import { IoInformationCircle } from "react-icons/io5";
import AppTooltip from "../../../../components/tooltip";

const EditTemplate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [templateTypeOption, setTemplateTypeOption] = useState([
    { value: "EMAIL", label: t('EMAIL') },
    { value: "NOTIFICATION", label: t('NOTIFICATION') }
  ])
  const [variableList, setVariableList] = useState([])

  const { id } = useParams()


  const [initialValues, setInitialValues] = useState({
    templateName: "",
    subject: "",
    content: "",
    templateType: "",
    userType: ""
  })

  useEffect(() => {

    if (id) {
      setLoading(true);
      getTemplateMaster(id)
        .then((response) => {
          setInitialValues({
            templateName: response?.data?.templateName ?? "",
            subject: response.data?.subject ?? "",
            content: response.data?.content ?? "",
            templateType: response?.data?.templateType ?? "",
            userType: response?.data?.userType ?? ""
          });

          // if (response?.data?.supportedVariables) {
          //   setVariableList(response?.data?.supportedVariables.split(","))
          // } else {
          //   setVariableList([])
          // }

         
        })
        .catch((error) => {
          console.error("Error get during to fetch", error);
        }).finally(()=>{
          setLoading(false);
        });



      templateKeywordListing(id)
        .then((response) => {
          if (response?.data) {
            setVariableList(response?.data)
          } else {
            setVariableList([])
          }

        })
        .catch((error) => {
          console.error("Error get during to fetch", error);
        }).finally(()=>{
          setLoading(false);
        });;
    }
  }, [id]);

  const onSubmit = async (values, actions) => {
    setLoading(true);
    editTemplateMaster(id, values).then(response => {
      setLoading(false);
      toast.success(response.data.message);
      actions.setSubmitting(false)
      navigate('/template-master')
    }).catch((error) => {
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
            <Row>
              <Col md>
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
                      <div className="text-break py-0">
                        <Row>
                          <Col lg={6}>
                            <ReactSelect
                              error={errors?.templateType}
                              options={templateTypeOption ?? []}
                              value={values?.templateType}
                              onChange={(option) => {
                                setFieldValue('templateType', option?.target?.value ?? "");
                              }}
                              disabled={true}
                              name="templateType"
                              label={t("TEMPLATE TYPE*")}
                              className={`${touched?.templateType && errors?.templateType ? "is-invalid" : ""
                                } mb-3 pb-1`}
                              onBlur={handleBlur}
                              touched={touched?.templateType}
                            />
                          </Col>
                          <Col lg={6}>
                            <ReactSelect
                              error={errors?.userType}
                              options={[
                                {
                                  value: '',
                                  label: t('SELECT')
                                },
                                {
                                  value: 'FI',
                                  label: t('FI')
                                },
                                {
                                  value: 'SEPS',
                                  label: t('SEPS')
                                },
                                {
                                  value: 'CUSTOMER',
                                  label: t('CUSTOMER')
                                },
                              ]}
                              disabled={true}
                              value={values?.userType}
                              onChange={(option) => {
                                setFieldValue("userType", option?.target?.value ?? "");
                              }}
                              name="userType"
                              label={t("USER_TYPE") + "*"}
                              className={`${touched?.userType && errors?.userType ? "is-invalid" : ""
                                } mb-3`}
                              onBlur={handleBlur}
                              touched={touched?.userType}
                            />

                          </Col>
                        </Row>
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
                          height="315"
                          handleBlur={handleBlur}
                          handleChange={(value) => {
                            setFieldValue("content", value === "<p><br></p>" ? "" : value);
                          }}
                        />
                        <Modal.Footer className="pt-0">
                          <Button
                            type="button"
                            variant="outline-dark"
                            onClick={() => { navigate('/template-master') }}
                            className="custom-min-width-85"
                          >
                            {t("CANCEL")}
                          </Button>
                          <Button
                            type="submit" // This ensures Formik handles the submission
                            variant="warning"
                            className="custom-min-width-85 ms-2"
                          >
                            {t("SUBMIT")}
                          </Button>
                        </Modal.Footer>
                      </div>
                    </FormikForm>
                  )}
                </Formik>
              </Col>
              <Col md="auto" >
                <Card className="sidebar-card">
                  <Card.Header className="border-0 ">
                    <p className="mb-0 fs-18 fw-semibold">{t("KEYWORD_LIST")}</p>
                  </Card.Header>
                  <Card.Body className="h-100 overflow-auto">
                    <ul className="variable-list ps-0">
                      {
                        variableList?.map((keyword, index) => (
                          <li key={index + 1} className={`${keyword?.isUse ? 'text-orange' :'text-primary'} mb-2 fs-16`}>
                            <AppTooltip title={keyword?.usage} placement="top">
                              <span>
                                <IoInformationCircle size={20} className="me-2" />
                              </span>
                            </AppTooltip>
                            {keyword.keyword}</li>
                        ))
                      }
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </React.Fragment>);
};

export default EditTemplate;
