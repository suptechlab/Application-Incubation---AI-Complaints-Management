import { Formik, Form as FormikForm } from "formik";
import React, { useState } from "react";
import { Button, Card, Col, Image, Row, Spinner, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import FormInput from "../../components/FormInput";
import PageHeader from "../../components/PageHeader";
import { handleChangePassword } from "../../services/authentication.service";
import { validationSchema } from "../../validations/changePassword.validation";
import profilePlaceholderImg from "../../assets/images/default-avatar.jpg";

export default function AccountProfile() {
  const [profileImage, setProfileImage] = useState("");

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
    await handleChangePassword(values)
      .then((response) => {
        toast.success(response.data.message);
        actions.resetForm();
      })
      .catch((error) => {
        actions.resetForm();
      });
  };

  return (
    <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
      <PageHeader title="Profile" />
      <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
        <Card.Body className="d-flex flex-column">
          <Formik
            initialValues={{
              nationalID: "ABCD12345XYZ",
              email: "john@email.com",
              firstName: "John",
              lastName: "Smith",
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
                  <Col lg={4} className="mb-3 pb-1 order-lg-last">
                    <div className="mb-1 fs-14">Profile Image</div>
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
                            Upload
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
                          label="National ID"
                          name="nationalID"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          touched={touched.nationalID}
                          type="text"
                          value={values.nationalID}
                          disabled={true}
                        />
                      </Col>
                      <Col sm={6}>
                        <FormInput
                          error={errors.email}
                          id="email"
                          key={"email"}
                          label="New Password"
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
                          label="First Name"
                          name="firstName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          touched={touched.firstName}
                          type="text"
                          value={values.firstName}
                          disabled={true}
                        />
                      </Col>
                      <Col sm={6}>
                        <FormInput
                          error={errors.lastName}
                          id="lastName"
                          key={"lastName"}
                          label="Last Name"
                          name="lastName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          touched={touched.lastName}
                          type="text"
                          value={values.lastName}
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
                      Cancel
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
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      ) : (
                        "Submit"
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
