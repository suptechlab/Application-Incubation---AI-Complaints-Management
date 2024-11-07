import { Formik, Form as FormikForm } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../components/FormInput";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import ReactSelect from "../../components/ReactSelect";
import Toggle from "../../components/Toggle";
import UserLoader from "../../components/UserLoader";
import {
  handleAddUser,
  handleGetRole,
  handleGetUserById,
  handleGetUserCompany,
  handleUpdateUser,
} from "../../services/user.service";
import { validationSchema } from "../../validations/user.validation";
import { countryCodes } from "../../constants/CountryCodes";
import { getOrganizationInfo, getPersonalInfo } from "../../services/fiusers.services";

export default function FIUserAddEdit() {
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loadingInfo, setLoadingInfo] = useState(false)

  const [companyOptions, setCompanyOptions] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);


  const [userData, setUserData] = useState([]);
  const [isImageSet, setIsImageSet] = useState(false);
  const [emailDisabled, setEmailDisabled] = useState(false);
  const { t } = useTranslation();
  const editUserValues = [];


  const formattedCountryCodes = countryCodes.map(country => ({
    value: country?.value,
    label: country?.value
  }));

  useEffect(() => {
    // handleGetUserCompany().then((response) => {
    //   let companiesList = [{ value: "", label: "Select company" }];
    //   if (response.data?.data?.length > 0) {
    //     response.data?.data?.forEach((category) => {
    //       companiesList.push({ value: category?.id, label: category?.title });
    //     });
    //   }
    //   setCompanyOptions(companiesList);
    // });

    // handleGetRole().then((response) => {
    //   let roleList = [{ value: "", label: "Select role" }];
    //   if (response.data?.data?.length > 0) {
    //     response.data?.data?.forEach((category) => {
    //       roleList.push({ value: category?.id, label: category?.name });
    //     });
    //   }
    //   setRolesOptions(roleList);
    // });
  }, []);

  const [initialValue, setInitialValues] = useState({
    userId: userData?.userId ? userData?.userId : "",
    name: userData?.name ? userData?.name : "",
    email: userData?.email ? userData?.email : "",
    mobileCode: "+91",
    mobileNo: userData?.mobileNo ? userData?.mobileNo : "",
    taxId: userData?.taxId ? userData?.taxId : "",
    entityName: userData?.entityName ? userData?.entityName : "",
    entityType: userData?.entityType ? userData?.entityType : "",
    companyId: userData?.companyId ? userData?.companyId : "",
    activated: userData?.activated ? userData?.activated : false,
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      handleGetUserById(id).then((response) => {
        setUserData(response.data.data);
        setEmailDisabled(response.data.data.email != "");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);


  // FETCH USER PERSONAL INFO BY ID
  const fetchUserData = async (userId) => {
    setLoadingInfo(true)
    getPersonalInfo(userId).then((response) => {
      setLoadingInfo(false)
      setInitialValues({ ...initialValue, userId: userId, name: response?.data?.nombreCompleto })
    })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      }).finally(() => {
        setLoadingInfo(false)
      })
  };

  // TAX ID 
  const fetchOrganizationData = async (taxId) => {
    setLoadingInfo(true)
    getOrganizationInfo(taxId).then((response) => {
      setLoadingInfo(false)
      setInitialValues({ ...initialValue, taxId: taxId, entityName: response?.data?.razonSocial,entityType:response?.data?.tipoOrganizacion })
    })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      }).finally(() => {
        setLoadingInfo(false)
      })
  }
  // HANDLE IDENTIFICATION
  const handleIdentificationBlur = (event) => {
    const userId = event.target.value;
    if (userId && userId !== "") {
      fetchUserData(userId) // Call the API function
    }
  };

  // HANDLE TAX ID BLUR
  const handleTaxIdBlur = (event) => {
    const taxID = event.target.value;
    if (taxID && taxID !== "") {
      fetchOrganizationData(taxID) // Call the API function
    }
  }


  // HANDLE SUBMIT
  const onSubmit = async (values) => {

    setUserLoading(true);
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
        navigate("/fi-users");
      } else {
        const response = await handleAddUser(formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(response.data.message);
        navigate("/fi-users");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <React.Fragment>
      <Loader isLoading={loading || loadingInfo} />
      <UserLoader
        isLoading={userLoading}
        title="Verifying User..."
      />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader title={`${isEdit ? "Edit" : "Add"} FI User`} />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <Formik
              initialValues={initialValue}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              enableReinitialize
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
                        error={errors?.userId}
                        id="userId"
                        key={"userId"}
                        label="ID"
                        name="userId"
                        onBlur={handleIdentificationBlur}
                        onChange={handleChange}
                        touched={touched?.userId}
                        type="number"
                        value={values?.userId || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.name}
                        id="name"
                        key={"name"}
                        label="Name"
                        name="name"
                        onBlur={handleBlur}
                        disabled={true}
                        onChange={handleChange}
                        touched={touched?.name}
                        type="text"
                        value={values?.name || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.email}
                        id="email"
                        key={"email"}
                        label="Email"
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched.email}
                        type="text"
                        value={values.email || ""}
                        disabled={emailDisabled}
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
                              options={formattedCountryCodes ?? []}
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
                            touched={touched.mobileNo}
                            type="text"
                            value={values.mobileNo || ""}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.taxId}
                        id="taxId"
                        key={"taxId"}
                        label="Entity's Tax ID (RUC)"
                        name="taxId"
                        onBlur={handleTaxIdBlur}
                        onChange={(option) => {
                          setFieldValue("taxId", option?.target?.value ?? "");
                        }}
                        touched={touched?.taxId}
                        type="number"
                        value={values?.taxId || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors.entityName}
                        id="entityName"
                        key={"entityName"}
                        label="Entity's Name"
                        name="entityName"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched.entityName}
                        type="text"
                        value={values.entityName || ""}
                        disabled={true}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors.entityName}
                        id="entityType"
                        key={"entityType"}
                        label="Entity type"
                        name="entityType"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched.entityType}
                        type="text"
                        value={values.entityType || ""}
                        disabled={true}
                      />
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
                        {t("CANCEL")}
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
