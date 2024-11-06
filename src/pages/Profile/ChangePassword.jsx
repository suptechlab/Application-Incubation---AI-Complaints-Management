import { Formik, Form as FormikForm } from "formik";
import React from "react";
import { Button, Card, Col, Row, Spinner, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import FormInput from "../../components/FormInput";
import PageHeader from "../../components/PageHeader";
import { handleChangePassword } from "../../services/authentication.service";
import { validationSchema } from "../../validations/changePassword.validation";
import { useTranslation } from "react-i18next";

export default function ChangePassword() {

  const { t } = useTranslation(); // use the translation hook

  const onSubmit = async (values, actions) => {
    delete values.confirmPassword;
    values.currentPassword = values.oldPassword;
    delete values.oldPassword;
    await handleChangePassword(values)
      .then((response) => {
        console.log('response',response)
        toast.success(response.data.message);
        actions.resetForm();
      })
      .catch((error) => {
        // console.log('error',error.response.data.errorDescription)
        toast.error(error.response.data.errorDescription ?? t('SOMETHING WENT WRONG'))
        actions.resetForm();
      });
  };

  return (
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <PageHeader title="Change Password" />
      <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
        <Card.Body className="d-flex flex-column">
          <Formik
            initialValues={{
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
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
                  <Col sm={8} md={6} lg={5} xl={4} xxl={3}>
                    <FormInput
                      error={errors.oldPassword}
                      id="oldPassword"
                      key={"oldPassword"}
                      label={t('OLD PASSWORD')}
                      name="oldPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      touched={touched.oldPassword}
                      type="password"
                      value={values.oldPassword}
                    />
                    <FormInput
                      error={errors.newPassword}
                      id="newPassword"
                      key={"newPassword"}
                      label={t('NEW PASSWORD')}
                      name="newPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      touched={touched.newPassword}
                      type="password"
                      value={values.newPassword}
                    />
                    <FormInput
                      error={errors.confirmPassword}
                      id="confirmPassword"
                      key={"confirmPassword"}
                      label={t('CONFIRM PASSWORD')}
                      name="confirmPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      touched={touched.confirmPassword}
                      type="password"
                      value={values.confirmPassword}
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
  );
}
