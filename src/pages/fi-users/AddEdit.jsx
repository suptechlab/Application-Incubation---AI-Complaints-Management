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
import UserLoader from "../../components/UserLoader";
import { countryCodes } from "../../constants/CountryCodes";
import { getOrganizationInfo, getPersonalInfo, handleAddFIUsers, handleEditFIUsers, handleGetFIuserById } from "../../services/fiusers.services";
import { getRolesDropdownData } from "../../services/rolerights.service";
import { validationSchema } from "../../validations/fiUsers.validation";

export default function FIUserAddEdit() {
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loadingInfo, setLoadingInfo] = useState(false)

  const [companyOptions, setCompanyOptions] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [rolesDropdownData, setRolesDropdownData] = useState([])


  const [FIuserData, setFIUserData] = useState([]);
  const [isImageSet, setIsImageSet] = useState(false);
  const [emailDisabled, setEmailDisabled] = useState(false);

  const { t } = useTranslation();

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
    identification: "",
    name: "",
    email: "",
    countryCode: "+1",
    phoneNumber: "",
    ruc: "",
    entityName: "",
    entityType: "",
    roleId: "",
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      handleGetFIuserById(id).then((response) => {
        console.log(response)
        // setFIUserData(response.data.data);

        setInitialValues({
          identification: response.data?.identification ? response.data?.identification : "",
          name: response.data?.name ? response.data?.name : "",
          email: response.data?.email ? response.data?.email : "",
          countryCode: response.data?.countryCode ?? "+1",
          phoneNumber: response.data?.mobileNo ? response.data?.phoneNumber : "",
          ruc: response.data?.taxId ? response.data?.taxId : "",
          entityName: response.data?.entityName ? response.data?.entityName : "",
          entityType: response.data?.entityType ? response.data?.entityType : "",
          roleId: response.data?.roleId ? response.data?.roleId : "",
        })
        // setEmailDisabled(response.data.data.email != "");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);


  // FETCH USER PERSONAL INFO BY ID
  const fetchUserData = async (identification) => {
    setLoadingInfo(true)
    getPersonalInfo(identification).then((response) => {
      setLoadingInfo(false)
      setInitialValues({ ...initialValue, identification: identification, name: response?.data?.nombreCompleto })
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
      setInitialValues({ ...initialValue, taxId: taxId, entityName: response?.data?.razonSocial, entityType: response?.data?.tipoOrganizacion })
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
    const identification = event.target.value;
    if (identification && identification !== "") {
      fetchUserData(identification) // Call the API function
    }
  };

  // HANDLE TAX ID BLUR
  const handleTaxIdBlur = (event) => {
    const taxID = event.target.value;
    if (taxID && taxID !== "") {
      fetchOrganizationData(taxID) // Call the API function
    }
  }

  //FETCH ROLES DROPDOWN DATA
  const fetchRolesDropdownData = () => {
    getRolesDropdownData('FI_USER').then((response) => {
      const mappedData = response?.data?.map(item => ({
        value: item.id,
        label: item.name
      }));
      setRolesDropdownData(mappedData ?? [])
    })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      })
  }

  useEffect(() => {
    fetchRolesDropdownData()
  }, [])

  // HANDLE SUBMIT
  const handleSubmit = async (values, actions) => {
    setUserLoading(true);

    let formData = {
      identificacion: values?.identificacion,
      name: values?.name,
      email: values?.email,
      langKey: "es",
      countryCode: values?.countryCode,
      phoneNumber: values?.phoneNumber,
      roleId: values?.roleId,
      ruc: values?.ruc
    }

    if (isEdit) {
      formData.id = id
      // CALL EDIT FI USERS API
      handleEditFIUsers(formData).then((response) => {
        toast.success(response?.data?.message);
        navigate("/fi-users")
      })
        .catch((error) => {
          if (error?.response?.data?.errorDescription) {
            toast.error(error?.response?.data?.errorDescription);
          } else {
            toast.error(error?.message);
          }
        })
        .finally(() => {
          actions.setSubmitting(false);
        });

    } else {
      // CALL ADD FI USER API
      handleAddFIUsers(formData).then((response) => {
        toast.success(response?.data?.message);
        navigate("/fi-users")
      })
        .catch((error) => {
          if (error?.response?.data?.errorDescription) {
            toast.error(error?.response?.data?.errorDescription);
          } else {
            toast.error(error?.message);
          }
        })
        .finally(() => {
          actions.setSubmitting(false);
        });
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
        <PageHeader title={`${isEdit ? t("EDIT") : t("ADD")} ${t("FI USER")}`} />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            <Formik
              initialValues={initialValue}
              validationSchema={validationSchema}
              onSubmit={(values, actions) => {
                actions.setSubmitting(true);
                handleSubmit(values, actions);
              }}
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
                  className="d-flex flex-column h-100"
                >
                  <Row>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.identification}
                        id="identification"
                        key={"identification"}
                        label={t("ID")}
                        name="identification"
                        onBlur={handleIdentificationBlur}
                        onChange={handleChange}
                        touched={touched?.identification}
                        type="number"
                        value={values?.identification || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.name}
                        id="name"
                        key={"name"}
                        label={t("NAME")}
                        name="name"
                        onBlur={handleBlur}
                        readOnly={true}
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
                        label={t("EMAIL")}
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
                      <label htmlFor="countryCode" className="mb-1 fs-14">
                        {t("PHONE")}
                      </label>
                      <Row className="gx-2">
                        <Col xs="auto">
                          <div className="custom-min-width-75 pe-1">
                            <ReactSelect
                              error={errors?.countryCode}
                              options={formattedCountryCodes ?? []}
                              value={values?.countryCode}
                              onChange={(option) => {
                                setFieldValue(
                                  "countryCode",
                                  option?.target?.value ?? ""
                                );
                              }}
                              name="countryCode"
                              className={
                                touched?.countryCode && errors?.countryCode
                                  ? "is-invalid"
                                  : ""
                              }
                              onBlur={handleBlur}
                              touched={touched?.countryCode}
                            />
                          </div>
                        </Col>
                        <Col xs>
                          <FormInput
                            error={errors?.phoneNumber}
                            id="phoneNumber"
                            key={"phoneNumber"}
                            name="phoneNumber"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            touched={touched?.phoneNumber}
                            type="text"
                            value={values?.phoneNumber || ""}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.ruc}
                        id="ruc"
                        key={"ruc"}
                        label={t("ENTITY'S TAX ID (RUC)")}
                        name="ruc"
                        onBlur={handleTaxIdBlur}
                        onChange={(option) => {
                          setFieldValue("ruc", option?.target?.value ?? "");
                        }}
                        touched={touched?.ruc}
                        type="number"
                        value={values?.ruc || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.entityName}
                        id="entityName"
                        key={"entityName"}
                        label={t("ENTITY'S NAME")}
                        name="entityName"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched?.entityName}
                        type="text"
                        value={values?.entityName || ""}
                        readOnly={true}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors?.entityName}
                        id="entityType"
                        key={"entityType"}
                        label={t("ENTITY TYPE")}
                        name="entityType"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched?.entityType}
                        type="text"
                        value={values?.entityType || ""}
                        readOnly={true}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <ReactSelect
                        label={t("ROLE")}
                        error={errors?.roleId}
                        options={rolesDropdownData ?? []}
                        value={values?.roleId}
                        onChange={(option) => {
                          setFieldValue(
                            "roleId",
                            option?.target?.value ?? ""
                          );
                        }}
                        name="roleId"
                        className={
                          touched?.roleId && errors?.roleId
                            ? "is-invalid"
                            : ""
                        }
                        onBlur={handleBlur}
                        touched={touched?.roleId}
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
                        {isEdit ? t("UPDATE") : t("SUBMIT")}
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
