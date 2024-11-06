import { Formik, Form as FormikForm } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Image, Row, Spinner, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import PageHeader from "../../components/PageHeader";
import { handleAccount, handleGetAccountDetail } from "../../services/authentication.service";
import { validationSchema } from "../../validations/profile.validation";
import profilePlaceholderImg from "../../assets/images/default-avatar.jpg";
import { useTranslation } from "react-i18next";
import { getLocalStorage } from '../../utils/storage';
import Loader from "../../components/Loader";

export default function AccountProfile() {

  const navigate = useNavigate()
  const { t } = useTranslation(); // use the translation hook
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("");

  const userLanguage = localStorage.getItem('langKey');

  const [initialValues, setInitialValues] = useState({
    nationalID: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const ALLOWEDIMAGETYPES =
    "Allowed image file extensions are .jpg, .jpeg and .png.";
  const IMAGESIZE = "Image size must not exceed 2.5 MB.";
  const IMAGESIZEINKB = 2500;

  const handleFileChange = (e) => {
    const fileLen = e.target.files.length;
    const file = e.target.files[0];
    if (!file) {
      console.log("##### handleFileChange #####", file);
      return;
    }
    const sizeofFile = file.size / 1024;
    if (sizeofFile > IMAGESIZEINKB) {
      toast.error(IMAGESIZE);
      return;
    }
    if (
      file.type !== "image/png" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/jpg"
    ) {
      toast.error(ALLOWEDIMAGETYPES);
      return;
    }

    if (fileLen > 0) {
      const fileObject = URL.createObjectURL(file);
      setProfileImage(fileObject);
    }
  };

  const onSubmit = async (values, actions) => {
    delete values.nationalID
    values.login = values.email
    values.langKey = userLanguage ?? 'es';
    values.countryCode = '+593'
    values.phoneNumber = '0123456789'

    await handleAccount(values)
      .then((response) => {
        toast.success(response.data.message);
        actions.resetForm();
        navigate('/dashboard')
      })
      .catch((error) => {
        actions.resetForm();
      });
  };

  useEffect(() => {
    handleGetAccountDetail().then(response => {
      console.log('response', response.data.firstName);
      setInitialValues({
        nationalID: response.data.nationalID ? response.data.nationalID : '',
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName, // Initialize stateId if editing
      });
      setLoading(false);
    });

  }, []);

  return (
    <>
    {loading ? (
      <Loader isLoading={loading} />
    ) : (
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <PageHeader title="Profile" />
      <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
        <Card.Body className="d-flex flex-column">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
            }) => (
              <FormikForm
                onSubmit={handleSubmit}
                className="d-flex flex-column h-100"
              >
                <Row>
                  {/* <pre>{JSON.stringify(errors, null, 2)}</pre>
                  <pre>{JSON.stringify(values, null, 2)}</pre> */}
                  <Col lg={4} className="mb-3 pb-1 order-lg-last">
                    <div className="mb-1 fs-14">{t('PROFILE IMAGE')}</div>
                    <Stack
                      direction="horizontal"
                      gap={2}
                      className="align-items-end"
                    >
                      <div className="me-1">
                        <Image
                          className="object-fit-cover border"
                          src={profileImage || profilePlaceholderImg}
                          alt="User Profile"
                          width={134}
                          height={134}
                        />
                      </div>
                      <div className="theme-upload-cover">
                        <div className="d-block overflow-hidden position-relative z-1">
                          <label
                            htmlFor="files"
                            className="btn btn-outline-dark custom-min-width-85"
                          >
                            {t('UPLOAD')}
                          </label>
                          <input
                            id="files"
                            accept="image/png, image/jpeg, image/jpg"
                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                            type="file"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    </Stack>
                  </Col>
                  <Col lg={8}>
                    <Row>
                      <Col sm={6}>
                        <FormInput
                          error={errors.nationalID}
                          id="nationalID"
                          key={"nationalID"}
                          label={t('NATIONAL ID')}
                          name="nationalID"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          touched={touched.nationalID}
                          type="text"
                          value={values.nationalID}
                        // disabled={true}
                        />
                      </Col>
                      <Col sm={6}>
                        <FormInput
                          error={errors.email}
                          id="email"
                          key={"email"}
                          label={t('EMAIL')}
                          name="email"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          touched={touched.email}
                          type="email"
                          value={values.email}
                          disabled={true}
                        />
                      </Col>
                      <Col sm={6}>
                        <FormInput
                          error={errors.firstName}
                          id="firstName"
                          key={"firstName"}
                          label={t('FIRST NAME')}
                          name="firstName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          touched={touched.firstName}
                          type="text"
                          value={values.firstName}
                        // disabled={true}
                        />
                      </Col>
                      <Col sm={6}>
                        <FormInput
                          error={errors.lastName}
                          id="lastName"
                          key={"lastName"}
                          label={t('LAST NAME')}
                          name="lastName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          touched={touched.lastName}
                          type="text"
                          value={values.lastName}
                        // disabled={true}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                  <Stack
                    direction="horizontal"
                    gap={3}
                    className="justify-content-end flex-wrap"
                  >
                    <Link
                      to={"/"}
                      className="btn btn-outline-dark custom-min-width-85"
                    >
                      {t('CANCEL')}
                    </Link>
                    <Button
                      type="submit"
                      variant="warning"
                      className="custom-min-width-85"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        <Spinner
                          size="sm"
                          animation="border"
                          role="output"
                          className="align-middle me-1"
                        >
                          <span className="visually-hidden">{t('LOADING')}...</span>
                        </Spinner>
                      ) : (
                        t('SUBMIT')
                      )}
                    </Button>
                  </Stack>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  )}
   </>
  );
}
