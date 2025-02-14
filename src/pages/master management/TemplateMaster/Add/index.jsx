import { Formik, Form as FormikForm } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Modal, Row, Stack } from "react-bootstrap";
import FormInput from "../../../../components/FormInput";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SunEditorReact from "../../../../components/SuneditorReact";
import { validationSchema } from "../../../../validations/templateMaster.validation";
import ReactSelect from "../../../../components/ReactSelect";
import { GoCheckCircleFill } from "react-icons/go";
import {
  createNewTemplateMaster,
  editTemplateMaster,
  getTemplateMaster,
  templateDetailForCopy,
  templateDropdownList,
  templateKeywordListing,
} from "../../../../services/templateMaster.service";
import Loader from "../../../../components/Loader";
import PageHeader from "../../../../components/PageHeader";
import { AuthenticationContext } from "../../../../contexts/authentication.context";
import AppTooltip from "../../../../components/tooltip";
import { IoInformationCircle } from "react-icons/io5";

const AddTemplate = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { currentUser } = useContext(AuthenticationContext);

  const [templateTypeOption, setTemplateTypeOption] = useState([
    { value: "EMAIL", label: t('EMAIL') },
    { value: "NOTIFICATION", label: t('NOTIFICATION') }
  ])

  const [initialValues, setInitialValues] = useState({
    templateName: "",
    userType: "",
    subject: "",
    content: "",
    templateId: "",
    templateType: "",
    usersType: currentUser
  })


  const [templateDropList, setTemplateDropList] = useState([])
  const [variableList, setVariableList] = useState([])

  const onSubmit = async (values, actions) => {
    const formValues = { ...values, copyFrom: values?.templateId }
    setLoading(true);
    createNewTemplateMaster(formValues).then(response => {
      toast.success(response.data.message);
      navigate('/template-master')
      setLoading(false);
      actions.setSubmitting(false)
    }).catch((error) => {
      setLoading(false);
      toast.error(error?.response?.data?.errorDescription ?? error?.description);
    });
  };

  // GET CLAIM TYPE DROPDOWN LIST
  const getTemplateDropdownList = () => {
    templateDropdownList().then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setTemplateDropList(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    })
  }


  const getTemplateKeywordList = (templateId) => {

    const params = templateId ? { templateId } : {};

    templateKeywordListing(params)
      .then((response) => {
        console.log(response)
        if (response?.data) {
          setVariableList(response?.data)
        } else {
          setVariableList([])
        }

      })
      .catch((error) => {
        console.error("Error get during to fetch", error);
      });
  }


  useEffect(() => {
    getTemplateKeywordList()
    getTemplateDropdownList()
  }, [])


  const getCopiedTemplateData = (templateId) => {
    setLoading(true)
    templateDetailForCopy(templateId).then(response => {
      if (response?.data) {
        setInitialValues({
          templateType: response?.data?.templateType ?? "",
          templateName: response?.data?.templateName ?? "",
          userType: response?.data?.userType ?? "",
          subject: response?.data?.subject ?? "",
          content: response?.data?.content ?? "",
          templateId: templateId,
        })

        getTemplateKeywordList(templateId)
        // if (response?.data?.supportedVariables) {
        //   setVariableList(response?.data?.supportedVariables.split(","))
        // } else {
        //   setVariableList([])
        // }

      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    }).finally(() => {
      setLoading(false)
    })
  }
  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader
          title={t("CREATE TEMPLATE MASTER")}
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
                              value={values.templateType}
                              onChange={(option) => {
                                setFieldValue('templateType', option.target.value);
                              }}
                              name="templateType"
                              label={t("TEMPLATE TYPE*")}
                              className={`${touched?.templateType && errors?.templateType ? "is-invalid" : ""
                                } `}
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
                        <Row>
                          <Col lg={12}>
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
                          </Col>
                          {
                            currentUser === "FI_USER" &&
                            <Col lg={12}>
                              <ReactSelect
                                error={errors?.templateId}
                                options={[
                                  {
                                    value: '',
                                    label: t('SELECT')
                                  },
                                  ...templateDropList,
                                ]}
                                value={values?.templateId}
                                onChange={(option) => {
                                  setFieldValue("templateId", option?.target?.value ?? "");
                                  getCopiedTemplateData(option?.target?.value)
                                }}
                                name="templateId"
                                label={t("TEMPLATES") + "*" + " (" + t("TEMPLATE_INFO_MESSAGE") + ")"}
                                className={`${touched?.templateId && errors?.templateId ? "is-invalid" : ""
                                  } mb-3`}
                                onBlur={handleBlur}
                                touched={touched?.templateId}
                              />
                            </Col>
                          }

                        </Row>
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
                          height="315"
                          content={values.content}
                          error={errors?.content}
                          touched={touched?.content}
                          handleBlur={handleBlur}
                          handleChange={(value) => {
                            setFieldValue("content", value === "<p><br></p>" ? "" : value);
                          }}
                        />
                      </div>
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
                    </FormikForm>
                  )}
                </Formik>
              </Col>

              <Col md="auto">
                <Card className="sidebar-card">
                  <Card.Header className="border-0">
                    <p className="mb-0 fs-18 fw-semibold">{t('KEYWORD_LIST')}</p>
                  </Card.Header>

                  <Card.Body>
                    <ul className="variable-list ps-0">
                      {
                        variableList?.map((keyword, index) => (
                          <li key={index + 1} className={`${keyword?.isUse ? 'text-orange' : 'text-primary'} mb-2 fs-16`}>
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
    </React.Fragment>)
};

export default AddTemplate;
