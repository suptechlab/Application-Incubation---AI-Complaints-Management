import { Formik, Form as FormikForm } from "formik";
import React, { useState } from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdOutlineSimCardDownload } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import sepsUsersFile from "../../assets/samplefiles/SEPS_USERS.xlsx";
import FormInput from "../../components/FormInput";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { handleImportSepsUsersApi } from "../../services/user.service";
import { fiImportValidationSchema } from "../../validations/fiUsers.validation";

const ImportSEPSUser = () => {

  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const [initialValue,setInitialValues] = useState({
    browseFile: "",
    description: "",
  });

  const [fileName, setFileName] = useState("");

  const navigate = useNavigate()

  //Handle File Change
  const handleFileChange = (event,setFieldValue) => {

    const file = event.target.files[0];

    if (file) {
      setFileName(file.name);
      setFieldValue('browseFile',file)
      event.target.value = ''
    } else {
      setFileName("");
    }
  };

  //Sumbit Handler
  const handleSubmit = (values,actions) => {

    if (!values.browseFile) {
      toast.error(t("PLEASE_SELECT_A_FILE_TO_UPLOAD"));
      return;
    }

    const formData = new FormData();
    formData.append('browseFile', values.browseFile);

    setLoading(true); // Set loading to true while the API call is in progress
    actions.setSubmitting(true)
    handleImportSepsUsersApi(formData)
      .then((response) => {
        if (response?.data?.status === 200) {
          navigate('/users')
          toast.success(response?.data?.message);
        } else {
          toast.error(response?.data?.message || t("Unexpected error occurred during file upload."));
        }
      
      })
      .catch((error) => {
        if (error?.response?.status === 400) {
          const errorData = error?.response?.data?.join('\n')
          actions.resetForm({ values: { browseFile: '', description: errorData } });
          // setInitialValues({ browseFile: '', description: errorData })
          setFileName("");
        }
        else if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message || t("STATUS UPDATE ERROR"));
        }
    
      })
      .finally(() => {
        actions.setSubmitting(false)
        setLoading(false); // Reset loading state after the API call
      });
  };


  console.log(initialValue)

  const handleSampleFileDownload = () => {
    // Define the URL of the sample file
    const fileUrl = sepsUsersFile; // Replace with your file URL
    const fileName = "SEPS_USERS.xlsx"; // Replace with the desired file name

    // Create an anchor element
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
  };
  return (
    <React.Fragment>
      <Loader isLoading={false} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader
          title={t("SEPS USERS")}
          actions={[
            {
              label: t("DOWNLOAD_SAMPLE_USER_TEMPLATE"),
              onClick: handleSampleFileDownload,
              variant: "outline-dark",
              icon: <MdOutlineSimCardDownload size={14} />,
            },
          ]}
        />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <Formik
              initialValues={initialValue}
              validationSchema={fiImportValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({
                errors,
                handleBlur,
                handleChange,
                handleSubmit,
                touched,
                values,
                setFieldValue,
                isSubmitting
              }) => (
                <FormikForm
                  onSubmit={handleSubmit}
                  className="d-flex flex-column h-100"
                >
                  <Row>
                    <Col xs={12} className="mb-3 pb-1">
                      <div className="mb-1 fs-14">{t('DATA_FILE')}</div>
                      <div className="theme-upload-cover d-inline-flex align-items-center gap-3">
                        <div className="overflow-hidden position-relative z-1 flex-shrink-0">
                          <label
                            htmlFor="browseFile"
                            className="btn btn-outline-dark custom-min-width-85"
                          >
                            {t('BROWSE')}
                          </label>
                          <input
                            id="browseFile"
                            accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                            type="file"
                            name="browseFile"
                            onChange={(event)=>handleFileChange(event , setFieldValue)}
                          />

                        </div>
                        {fileName && (
                          <Link
                            target="_blank"
                            to="/fi-users/import"
                            className="text-decoration-none small mw-100 text-break"
                          >
                            {fileName}
                          </Link>
                        )}
                      </div>
                      <p>
                        {touched?.browseFile && errors?.browseFile && <small className="form-text text-danger">{errors?.browseFile}</small>}
                      </p>
                    </Col>
                    <Col md={10} lg={8}>
                      <FormInput
                        error={errors.description}
                        isTextarea={true}
                        id="description"
                        key={"description"}
                        label={t("ERROR_DETAILS")}
                        name="description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched?.description}
                        rows={7}
                        disabled={true}
                        type="text"
                        value={values?.description || ""}
                      />
                    </Col>
                  </Row>

                  <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                    <Stack
                      direction="horizontal"
                      gap={3}
                      className="justify-content-end flex-wrap"
                    >
                      <Link
                        to={"/fi-users"}
                        className="btn btn-outline-dark custom-min-width-85"
                      >
                        {t('CANCEL')}
                      </Link>
                      <Button
                        type="submit"
                        variant="warning"
                        className="custom-min-width-85"
                        disabled={isSubmitting ?? false}
                      >
                         {t('SUBMIT')}
                      </Button>
                    </Stack>
                  </div>
                </FormikForm>
              )}
            </Formik>
          </Card.Body>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default ImportSEPSUser;
