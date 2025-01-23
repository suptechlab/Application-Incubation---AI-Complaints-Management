import { Formik, Form as FormikForm } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Image, Placeholder, Row, Spinner, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import profilePlaceholderImg from "../../assets/images/default-avatar.jpg";
import FormInput from "../../components/FormInput";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { handleAccount } from "../../services/authentication.service";
import { validationSchema } from "../../validations/profile.validation";

export default function AccountProfile() {
  const { userData, profileImage, isDownloadingImg, isLoading, currentUser,handleAccountDetails } = useContext(AuthenticationContext);
  const { t } = useTranslation(); // use the translation hook
  const [profileImg, setProfileImg] = useState("");


  const [initialValues, setInitialValues] = useState({
    nationalID: userData?.identificacion ? userData?.identificacion : '',
    email: userData?.email,
    firstName: userData?.firstName,
    profile: ''
  });

  const ALLOWEDIMAGETYPES =
    t("ALLOWED_IMAGE_TYPES_ERROR_MESSAGE");
  const IMAGESIZE = t("ALLOWED_IMAGE_SIZE_ERROR_MESSAGE");
  const IMAGESIZEINKB = 2500;

  const handleFileChange = (e, setFieldValue) => {
    const fileLen = e.target.files.length;
    const file = e.target.files[0];
    if (!file) {
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
      setProfileImg(fileObject);
      setFieldValue('profile', file)
    }
  };

  const onSubmit = async (values, actions) => {
    actions.setSubmitting(true)

    const formData = new FormData()

    if (values?.profile && values?.profile !== '') {
      formData.append('profilePicture', values?.profile)
    }

    handleAccount(formData)
      .then((response) => {
        handleAccountDetails()
        toast.success(response?.data?.message);
      })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      }).finally(() => {
        actions.setSubmitting(false)
      });
  };

  useEffect(() => {
    if (userData) {
      setInitialValues({
        nationalID: userData?.identificacion ? userData?.identificacion : '',
        email: userData?.email,
        firstName: userData?.firstName,
        profile: ''
      });
    }

  }, [userData]);

  return (
    <>
      <Loader isLoading={isLoading} />
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
                setFieldValue
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
                          {
                            !isDownloadingImg ?
                              <Image
                                className="object-fit-cover border"
                                src={profileImage || profileImg || profilePlaceholderImg}
                                alt="User Profile"
                                width={134}
                                height={134}
                              /> : <div class="card-text placeholder-glow custom-width-134 custom-height-134">
                                <span class="placeholder  d-block h-100" ></span>
                              </div>
                          }
                        </div>
                        <div className="theme-upload-cover">
                          <div className="d-block overflow-hidden position-relative z-1">
                            <label
                              htmlFor="files"
                              className="btn btn-outline-dark custom-min-width-85"
                            >
                              {t('BROWSE_IMAGE')}
                            </label>
                            <input
                              name="profile"
                              id="files"
                              accept="image/png, image/jpeg, image/jpg"
                              className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                              type="file"
                              onChange={(event) => handleFileChange(event, setFieldValue)}
                            />
                          </div>
                          <span> {values?.profile ? values?.profile?.fileName : ''} </span>
                          {touched?.profile && errors?.profile && <small className="form-text text-danger">{errors?.profile}</small>}
                        </div>
                      </Stack>
                    </Col>
                    <Col lg={8}>
                      <Row>
                        {
                          currentUser === 'FI_USER' ? <Col sm={6}>
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
                              disabled={true}
                            />
                          </Col> : ''
                        }

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
                            disabled={true}
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

    </>
  );
}
