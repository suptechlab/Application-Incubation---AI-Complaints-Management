import { Formik, Form as FormikForm } from "formik";
import React, { useContext, useEffect, useState } from "react";
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
import { AuthenticationContext } from "../../contexts/authentication.context";

export default function FIUserAddEdit() {

  const { currentUser, userData } = useContext(AuthenticationContext)

  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loadingInfo, setLoadingInfo] = useState(false)

  const [rolesDropdownData, setRolesDropdownData] = useState([])

  const { t } = useTranslation();

  const formattedCountryCodes = countryCodes.map(country => ({
    value: country?.value,
    label: country?.value
  }));

  const [initialValue, setInitialValues] = useState({
    identification: "",
    name: "",
    email: "",
    countryCode: "+593",
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
        setInitialValues({
          identification: response.data?.identificacion ? response.data?.identificacion : "",
          name: response.data?.name ? response.data?.name: "",
          email: response.data?.email ? response.data?.email : "",
          countryCode: response?.data?.countryCode ?? "+593",
          phoneNumber: response?.data?.phoneNumber ? response?.data?.phoneNumber : "",
          ruc: response?.data?.organization?.ruc ? response?.data?.organization?.ruc : "",
          entityName: response?.data?.organization?.razonSocial ? response?.data?.organization?.razonSocial: "",
          entityType: response.data?.organization?.tipoOrganizacion ? response.data?.organization?.tipoOrganizacion: "",
          roleId: response.data?.roleId ? response.data?.roleId : "",
        })
        setLoading(false);
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      }).finally(() => {
        setLoading(false)
      });
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

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

  // FETCH USER PERSONAL INFO BY ID
  const fetchUserData = async (identification, setFieldValue) => {
    setLoadingInfo(true)
    getPersonalInfo(identification).then((response) => {
      setLoadingInfo(false)
      if (response?.data?.nombreCompleto) {
        setFieldValue("name",response?.data?.nombreCompleto ?? '')
      } else {
        setFieldValue("name", "")
      }
    })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
        setFieldValue("name", "")
      }).finally(() => {
        setLoadingInfo(false)
      })
  };

  // TAX ID 
  const fetchOrganizationData = async (ruc, setFieldValue) => {
    setLoadingInfo(true)
    getOrganizationInfo(ruc).then((response) => {
      setLoadingInfo(false)
      if (response?.data?.razonSocial) {
        setFieldValue('entityName', response?.data?.razonSocial ?? '')
        setFieldValue('entityType', response?.data?.tipoOrganizacion ?? '')
      } else {
        setFieldValue('entityName', '')
        setFieldValue('entityType', '')
      }
    })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
        setFieldValue('entityName', '')
        setFieldValue('entityType', '')
      }).finally(() => {
        setLoadingInfo(false)
      })
  }
  // HANDLE IDENTIFICATION
  const handleIdentificationBlur = (event, setFieldValue) => {
    const identification = event.target.value;
    if (identification && identification !== "") {
      fetchUserData(identification, setFieldValue) // Call the API function
    }
  };

  // HANDLE TAX ID BLUR
  const handleTaxIdBlur = (event, setFieldValue) => {
    const ruc = event.target.value;
    if (ruc && ruc !== "") {
      fetchOrganizationData(ruc, setFieldValue) // Call the API function
    }
  }


  // HANDLE SUBMIT
  const handleSubmit = async (values, actions) => {
    setUserLoading(true);

    let formData = {
      identificacion: values?.identification,
      name: values?.name,
      email: values?.email,
      langKey: "es",
      countryCode: values?.countryCode,
      phoneNumber: values?.phoneNumber,
      roleId: values?.roleId,
      ruc: values?.ruc
    }

    if (isEdit) {
      // formData.id = id
      // CALL EDIT FI USERS API
      handleEditFIUsers(id, formData).then((response) => {
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
          setUserLoading(false);
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
          setUserLoading(false);
        });
    }
  };


  useEffect(() => {
    if (currentUser === 'FI_USER') {
      setInitialValues({
        ...initialValue,
        ruc: userData?.organization?.ruc,
        entityName: userData?.organization?.razonSocial ?? '',
        entityType: userData?.organization?.tipoOrganizacion ?? ''
      })
    }
  }, [currentUser])

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
                        onBlur={(event) => handleIdentificationBlur(event, setFieldValue)}
                        onChange={handleChange}
                        touched={touched?.identification}
                        type="number"
                        value={values?.identification || ""}
                        readOnly={isEdit ? true : false}
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
                        readOnly={isEdit ? true : false}
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
                        onBlur={(event) => handleTaxIdBlur(event, setFieldValue)}
                        onChange={(option) => {
                          setFieldValue("ruc", option?.target?.value ?? "");
                        }}
                        touched={touched?.ruc}
                        type="number"
                        value={values?.ruc || ""}
                        readOnly={isEdit ? true : false}
                        disabled={currentUser === 'FI_USER' ? true : false}
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
                        disabled={isSubmitting ?? false}
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
