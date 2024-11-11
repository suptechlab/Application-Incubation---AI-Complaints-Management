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
import {
  handleAddUser,
  handleGetRole,
  handleGetUserById,
  handleGetUserCompany,
  handleUpdateUser,
} from "../../services/user.service";
import { validationSchema } from "../../validations/user.validation";
import UserLoader from "../../components/UserLoader";

export default function AddStatePage() {

  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [companyOptions, setCompanyOptions] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);

  const [countryCodeData, setCountryCodeData] = useState([
    { label: "+91", value: "+91" },
    { label: "+593", value: "+593" },
  ]);
  const [userData, setUserData] = useState([]);
  const [isImageSet, setIsImageSet] = useState(false);
  const [emailDisabled, setEmailDisabled] = useState(false);
  const { t } = useTranslation();
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    roleId: "",
    mobileCode: "+91",
    mobileNo: "",
    activated: true,
    profileImage: "",
  });

  useEffect(() => {
    const userType = 'SEPS_USER';
    handleGetRole(userType).then((response) => {
      let roleList = [{ value: "", label: "Select role" }];
      if (response.data?.length > 0) {
        response.data?.forEach((roles) => {
          roleList.push({ value: roles?.id, label: roles?.name });
        });
      }
      setRolesOptions(roleList);
    });
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      handleGetUserById(id).then((response) => {
        setUserData(response.data);
        setEmailDisabled(response.data?.email == "" ? false : true);

        setInitialValues({
          name: response.data?.name ? response.data?.name : "",
          email: response.data?.email ? response.data?.email : "",
          roleId: response.data?.roleId ??  "",
          // activated: response.data?.status == 'ACTIVE' ? true : false,
          //mobileCode: "+91",
          // mobileNo: userData?.mobileNo ? userData?.mobileNo : "",
          // activated: userData?.activated ? userData?.activated : false,
          // profileImage: userData?.imageUrl ? userData?.imageUrl : "",
        });
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const onSubmit = async (values, actions) => {
    setUserLoading(true);
    // const formData = new FormData();
    // if (!isImageSet) {
    //   delete values.profileImage;
    // }
    // for (const key in values) {
    //   formData.append(key, values[key]);
    // }

    try {
      if (isEdit) {
        // formData.append("id", id);
        // const response = await handleUpdateUser(id, formData, {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // });
        
       
        delete values.profileImage;
        delete values.profileImage;
        delete values.activated;
        delete values.mobileCode;
        delete values.mobileNo;
        await handleUpdateUser( id, { ...values }).then((response) => {
          toast.success(response.data.message)
          actions.resetForm()
          navigate('/users')
        }).catch((error) => {
          setUserLoading(false);
          toast.error(error.response.data.detail);

        }).finally(() => {
          actions.setSubmitting(false)
        })
      }
      else {
        
        delete values.profileImage;
        delete values.profileImage;
        delete values.activated;
        delete values.mobileCode;
        delete values.mobileNo;
        await handleAddUser({ ...values }).then((response) => {
          toast.success(response.data.message)
          actions.resetForm()
          navigate('/users')
        }).catch((error) => {
          setUserLoading(false);
          toast.error(error.response.data.detail);

        }).finally(() => {
          actions.setSubmitting(false)
        })
      }
    } catch (error) {
      setUserLoading(false);
      toast.error(t('SOMETHING WENT WRONG'));
    }
  };

  return (
    <React.Fragment>
      <Loader isLoading={loading} />
      <UserLoader
        isLoading={userLoading}
        title="Verifying User..."
        subTitle="Using SEPS Active Directory"
      />
      <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
        <PageHeader title={`${isEdit ? t('EDIT SEPS') : t('ADD SEPS')}  `} />
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
          <Card.Body className="d-flex flex-column">
            {
              loading ? "" : 
            
            <Formik
              initialValues={initialValues}
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
                    {/* <pre>{JSON.stringify(initialValues,null,2)}</pre> */}
                    {/* <pre>{JSON.stringify(values,null,2)}</pre> */}
                    {/* <pre>{JSON.stringify(errors,null,2)}</pre> */}
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors.email}
                        id="email"
                        key={"email"}
                        label={t('EMAIL')}
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
                      <FormInput
                        error={errors.name}
                        id="name"
                        key={"name"}
                        label={t('NAME')}
                        name="name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched.name}
                        type="text"
                        value={values.name || ""}
                      />
                    </Col>
                    <Col sm={6} md={6} lg={4}>
                      <FormInput
                        error={errors.unidadOrganizacional}
                        id="unidadOrganizacional"
                        key={"unidadOrganizacional"}
                        label={t('UNIDAD ORGANIZACIONAL')}
                        name="unidadOrganizacional"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        touched={touched.unidadOrganizacional}
                        type="text"
                        value={values.unidadOrganizacional || ""}
                      />
                    </Col>
                    {/* <Col sm={6} md={6} lg={4}>
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
                            touched={touched.mobileNo}
                            type="text"
                            value={values.mobileNo || ""}
                          />
                        </Col>
                      </Row>
                    </Col> */}
                    <Col sm={6} md={6} lg={4}>
                      <ReactSelect
                        label={t('ROLE')}
                        error={errors.roleId}
                        options={rolesOptions}
                        value={values.roleId}
                        onChange={(option) => {
                          setFieldValue(
                            "roleId",
                            option?.target?.value ?? ""
                          );
                        }}
                        name="roleId"
                        className={
                          touched.roleId && errors.roleId
                            ? "is-invalid"
                            : ""
                        }
                        onBlur={handleBlur}
                        touched={touched.roleId}
                      />
                    </Col>
                    {/* <Col xs={12} className="mb-3 pb-1">
                      <label htmlFor="activated" className="mb-1 fs-14">
                        {t('STATUS')}
                      </label>
                      <Toggle
                        id="activated"
                        key={"activated"}
                        name="activated"
                        onChange={handleChange}
                        value={values.activated}
                      />
                    </Col> */}
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
                        {t('CANCEL')}
                      </Link>
                      <Button
                        type="submit"
                        variant="warning"
                        className="custom-min-width-85"
                      >
                        {isEdit ? t('UPDATE') : t('SUBMIT')}
                      </Button>
                    </Stack>
                  </div>
                </FormikForm>
              )}
            </Formik>
            }
          </Card.Body>
        </Card>
      </div>
    </React.Fragment>
  );
}
