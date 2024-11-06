import { Formik, Form as FormikForm } from "formik";
import React, { useState } from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import { MdOutlineSimCardDownload } from "react-icons/md";
import { Link } from "react-router-dom";
import FormInput from "../../components/FormInput";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { validationSchema } from "../../validations/fiUsers.validation";

const ImportFIUser = () => {
  const initialValue = {
    dataFile: "",
    description: "",
  };

  const [fileName, setFileName] = useState("Fi_Users_data.xlsx");

  //Handle File Change
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("Fi_Users_data.xlsx");
    }
  };

  //Sumbit Handler
  const onSubmit = (values) => {
    console.log("values", values);
  };

  return (
    <React.Fragment>
      <Loader isLoading={false} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader
          title="FI Users"
          actions={[
            {
              label: "Download Sample User Template",
              to: "/fi-users/import",
              variant: "outline-dark",
              icon: <MdOutlineSimCardDownload size={14} />,
            },
          ]}
        />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <Formik
              initialValues={initialValue}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({
                errors,
                handleBlur,
                handleChange,
                handleSubmit,
                touched,
                values,
                setFieldValue,
              }) => (
                <FormikForm
                  onSubmit={handleSubmit}
                  className="d-flex flex-column h-100"
                >
                  <Row>
                    <Col xs={12} className="mb-3 pb-1">
                      <div className="mb-1 fs-14">Data File</div>
                      <div className="theme-upload-cover d-inline-flex align-items-center gap-3">
                        <div className="overflow-hidden position-relative z-1 flex-shrink-0">
                          <label
                            htmlFor="files"
                            className="btn btn-outline-dark custom-min-width-85"
                          >
                            Browse
                          </label>
                          <input
                            id="files"
                            accept="image/png, image/jpeg, image/jpg"
                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                            type="file"
                            onChange={handleFileChange}
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
                    </Col>
                    <Col md={10} lg={8}>
                      <FormInput
                        error={errors.description}
                        isTextarea={true}
                        id="description"
                        key={"description"}
                        label="Error Details"
                        name="description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched?.description}
                        rows={7}
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
                        Cancel
                      </Link>
                      <Button
                        type="submit"
                        variant="warning"
                        className="custom-min-width-85"
                      >
                        Submit
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

export default ImportFIUser;
