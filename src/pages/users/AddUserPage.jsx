import { Form as FormikForm, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { validationSchema } from "../../validations/user.validation";
import SvgIcons from "../../components/SVGIcons";
import {
  handleGetUserById,
  handleAddUser,
  handleUpdateUser,
  handleGetCompany,
  handleGetRole,
  handleUserResetPassword,
  handleGetUserCompany,
} from "../../services/user.service";
import Toggle from "../../components/Toggle";
import FormInput from "../../components/FormInput";
import { HiMiniUsers } from "react-icons/hi2";
import FormSelect from "../../components/FormSelect";
import axios from "axios";
import { getLocalStorage } from "../../utils/storage";
import defaultImage from "../../assets/images/broken_image.png";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import ReactSelect from "../../components/ReactSelect";

export default function AddStatePage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(defaultImage);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = useParams();
  const isEdit = !!id;

  const [companyOptions, setCompanyOptions] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);

  const [countryCodeData, setCountryCodeData] = useState([
    { label: "+91", value: "+91" },
  ]);
  const [userData, setUserData] = useState([]);
  const [isImageSet, setIsImageSet] = useState(false);
  const [emailDisabled, setEmailDisabled] = useState(false);
  const { t } = useTranslation();
  const editUserValues = [];

  useEffect(() => {
    handleGetUserCompany().then((response) => {
      let companiesList = [{ value: "", label: "Select company" }];
      if (response.data?.data?.length > 0) {
        response.data?.data?.forEach((category) => {
          companiesList.push({ value: category?.id, label: category?.title });
        });
      }
      setCompanyOptions(companiesList);
    });

    handleGetRole().then((response) => {
      let roleList = [{ value: "", label: "Select role" }];
      if (response.data?.data?.length > 0) {
        response.data?.data?.forEach((category) => {
          roleList.push({ value: category?.id, label: category?.name });
        });
      }
      setRolesOptions(roleList);
    });
  }, []);

  const initialValue = {
    firstName: userData?.firstName ? userData?.firstName : "",
    lastName: userData?.lastName ? userData?.lastName : "",
    email: userData?.email ? userData?.email : "",
    mobileCode: "+91",
    mobileNo: userData?.mobileNo ? userData?.mobileNo : "",
    roleId: userData?.roleId ? userData?.roleId : "",
    companyId: userData?.companyId ? userData?.companyId : companyOptions[0],
    activated: userData?.activated ? userData?.activated : false,
    profileImage: userData?.imageUrl ? userData?.imageUrl : "",
  };

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      handleGetUserById(id).then((response) => {
        setUserData(response.data.data);
        setEmailDisabled(response.data.data.email == "" ? false : true);

        // setInitialValues({
        //     firstName: 'hello',
        //     lastName: response.data.data?.lastName,
        //     email: response.data.data?.email,
        //     mobileCode: response.data.data?.mobileCode ? response.data.data?.mobileCode : '+91',
        //     mobileNo: response.data.data?.mobileNo,
        //     activated: response.data.data?.activated,
        //     roleId: response.data.data?.roleId,
        //     companyId: response.data.data?.companyId,
        //     profileImage: response.data.data?.imageUrl

        // });
        setImageUrl(response.data.data?.imageUrl);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const onSubmit = async (values) => {
    const formData = new FormData();
    if (!isImageSet) {
      delete values.profileImage;
    }
    for (const key in values) {
      formData.append(key, values[key]);
    }

    try {
      if (isEdit) {
        formData.append("id", id);
        const response = await handleUpdateUser(id, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(response.data.message);
        navigate("/users");
      } else {
        const response = await handleAddUser(formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(response.data.message);
        navigate("/users");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleUploadImage = (event, setFieldValue) => {
    console.log("file type", event.target.files[0].type);

    const file = event.target.files[0];
    const validTypes = ["image/png", "image/jpg", "image/jpeg"];

    if (!validTypes.includes(file.type)) {
      return toast.error("Please select only png, jpg and jpeg file.");
    }
    setFieldValue("profileImage", file);
    if (event.target.files && event.target.files.length > 0) {
      //setImageUrl(event.target.files[0]);// Image Preview
      setImageUrl(URL.createObjectURL(event.target.files[0])); // Image Preview
    }
    setIsImageSet(true);
    //setImageUrl(event.target.files[0]) // Image Preview
  };

  const ResetPassword = async () => {
    //setLoading(true)
    handleUserResetPassword(id)
      .then((response) => {
        //setLoading(false)
        toast.success(response.data.message);
        //navigate("/users");
      })
      .catch((error) => {
        //setLoading(false)
        toast.error(error.response.data.message);
      });
  };

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader title={`${isEdit ? "Edit" : "Add"} SEPS User`} />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <Formik
              initialValues={initialValue}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              // enableReinitialize
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
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors.email}
                        id="email"
                        key={"email"}
                        label="Email"
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter email"
                        touched={touched.email}
                        type="text"
                        value={values.email || ""}
                        disabled={emailDisabled}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors.firstName}
                        id="firstName"
                        key={"firstName"}
                        label="Name"
                        name="firstName"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        touched={touched.firstName}
                        type="text"
                        value={values.firstName || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors.unidadOrganizacional}
                        id="unidadOrganizacional"
                        key={"unidadOrganizacional"}
                        label="Unidad Organizacional"
                        name="unidadOrganizacional"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter unidad organizacional"
                        touched={touched.unidadOrganizacional}
                        type="text"
                        value={values.unidadOrganizacional || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <label htmlFor="mobileCode" className="mb-1 fs-14">
                        Phone
                      </label>
                      <Row className="gx-2">
                        <Col xs="auto">
                          <div className="custom-min-width-75 pe-1">
                            <ReactSelect
                              error={errors.mobileCode}
                              options={countryCodeData}
                              value={values.mobileCode}
                              onChange={(option) => {
                                setFieldValue(
                                  "mobileCode",
                                  option?.target?.value ?? ""
                                );
                              }}
                              name="mobileCode"
                              className={
                                touched.mobileCode && errors.mobileCode
                                  ? "is-invalid"
                                  : ""
                              }
                              onBlur={handleBlur}
                              touched={touched.mobileCode}
                            />
                          </div>
                        </Col>
                        <Col xs>
                          <FormInput
                            error={errors.mobileNo}
                            id="mobileNo"
                            key={"mobileNo"}
                            name="mobileNo"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            touched={touched.mobileNo}
                            type="text"
                            value={values.mobileNo || ""}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <ReactSelect
                        label="Role"
                        error={errors.companyId}
                        options={companyOptions}
                        value={values.companyId}
                        onChange={(option) => {
                          setFieldValue(
                            "companyId",
                            option?.target?.value ?? ""
                          );
                        }}
                        name="companyId"
                        className={
                          touched.companyId && errors.companyId
                            ? "is-invalid"
                            : ""
                        }
                        onBlur={handleBlur}
                        touched={touched.companyId}
                      />
                    </Col>
                    <Col xs={12}>
                      <label htmlFor="activated" className="mb-1 fs-14">
                        Status
                      </label>
                      <Toggle
                        id="activated"
                        key={"activated"}
                        name="activated"
                        onChange={handleChange}
                        value={values.activated}
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
                        to={"/users"}
                        className="btn btn-outline-dark custom-min-width-85"
                      >
                        Cancel
                      </Link>
                      <Button
                        type="submit"
                        variant="warning"
                        className="custom-min-width-85"
                      >
                        {isEdit ? "Update" : "Submit"}
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
}
