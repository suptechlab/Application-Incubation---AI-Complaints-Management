import { Formik, Form as FormikForm } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../components/FormInput";
import PageHeader from "../../components/PageHeader";
import {
  fetchModulesAndPermissions,
  handleAddRoleRight,
  handleEditRoleRight,
  handleGetRoleRightById,
} from "../../services/rolerights.service";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";
import { validationSchema } from "../../validations/rolerights.validation";

const RoleRightsForm = () => {

  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    rights: {},
  });

  const [modules, setModules] = useState([]);
  const [userType, setUserType] = useState('SEPS_USER');
  

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      handleGetRoleRightById(id).then((response) => {
        const roleData = response.data;
        const rights = roleData.modules.reduce((acc, module) => {
          acc[module.name] = module.permissions.reduce(
            (permAcc, permission) => {
              permAcc[permission.name] = {
                checked: permission.checked,
                id: permission.id,
              };
              return permAcc;
            },
            {}
          );
          return acc;
        }, {});

        setInitialValues({
          name: roleData.name,
          description: roleData.description,
          rights: rights,
          userType: roleData.userType,
        });
        
        setUserType(roleData.userType); // SEPS_USER/FI_USER
        setModules(response.data.modules);
      });
      setLoading(false);
    } else {
      
    }
  }, [id, isEdit, userType]);


  useEffect(() => {
    setLoading(true);
    //setUserType('SEPS_USER'); // SEPS_USER/FI_USER
    fetchModulesAndPermissions(userType).then((response) => {
      setModules(response.data);
    });
    setLoading(false);
  }, [userType])

  // const handleCheckboxChange = (e, module, permission, permissionId) => {
  //     setInitialValues(prevValues => ({
  //         ...prevValues,
  //         rights: {
  //             ...prevValues.rights,
  //             [module]: {
  //                 ...prevValues.rights[module],
  //                 [permission]: {
  //                     checked: e.target.checked,
  //                     id: permissionId,
  //                 },
  //             },
  //         },
  //     }));
  // };

  const handleCheckboxChange = (
    e,
    module,
    permission,
    permissionId,
    values,
    setFieldValue
  ) => {
    const updatedRights = {
      ...values.rights,
      [module]: {
        ...values.rights[module],
        [permission]: {
          checked: e.target.checked,
          id: permissionId,
        },
      },
    };
    setFieldValue("rights", updatedRights);
  };

  const onSubmit = async (values) => {

    const permissionIds = Object.keys(values.rights).flatMap((module) =>
      Object.keys(values.rights[module])
        .filter((permission) => values.rights[module][permission].checked)
        .map((permission) => values.rights[module][permission].id)
    );

    const payload = {
      userType: userType,
      name: values.name,
      description: values.description,
      permissionIds: permissionIds,
    };

    if (isEdit) {
      await handleEditRoleRight(id, payload)
        .then((response) => {
          toast.success(response.data.message);
          navigate("/role-rights");
        })
        .catch((error) => {
          toast.error(error.response.data.errorDescription);
        });
    } else {
      handleAddRoleRight(payload)
        .then((response) => {
          toast.success(response.data.message);
          navigate("/role-rights");
        })
        .catch((error) => {
          if (error.response.data.fieldErrors) {
            toast.error(error.response.data.fieldErrors[0].message);
          } else {
            toast.error(error.response.data.errorDescription);
          }
        });
    }
  };

  return (
    <>
      {
        loading ? <Loader isLoading={loading} /> :
          <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
            <PageHeader title={`${isEdit ? t('EDIT') : t('ADD')} ${t('ROLE & RIGHTS')}`} />
            <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
              <Card.Body className="d-flex flex-column">
                <Formik
                  initialValues={initialValues}
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
                        {/* <pre>{JSON.stringify(values,null,2)}</pre> */}
                        <Col xs={12}>
                          <Row>
                            <Col md={4}>
                              <div className='d-flex justify-content-between status-radio'>
                                <div>
                                  <label className='fs-13 fw-bolder'>{t('USER TYPE')}</label>
                                </div>
                                <div className='d-flex'>
                                    <label className="form-check-label">
                                      <input
                                        className="form-check-input radio-inline"
                                        type="radio"
                                        name="userType"
                                        value="SEPS_USER"
                                        checked={userType == 'SEPS_USER'}
                                        onChange={() => {
                                          setFieldValue("rights", {}); 
                                          setFieldValue("userType", "SEPS_USER");
                                          setUserType('SEPS_USER');
                                        }}
                                        disabled={isEdit} // Disable in edit mode
                                      />
                                      {t('SEPS USER')}
                                    </label>
                                    <label className="form-check-label ms-3">
                                      <input
                                        className="form-check-input radio-inline"
                                        type="radio"
                                        name="userType"
                                        value="FI_USER"
                                        checked={values.userType == 'FI_USER'}
                                        onChange={() => {
                                          
                                          setFieldValue("rights", {}); 
                                          setFieldValue("userType", "FI_USER");
                                          setUserType('FI_USER');
                                        }}
                                        disabled={isEdit} // Disable in edit mode
                                      />
                                      {t('FI USER')}
                                    </label>
                                  </div>
                              </div>

                            </Col>
                          </Row>
                          <Row>
                            <Col md={4}>
                              <FormInput
                                error={errors.name}
                                id="name"
                                key={"name"}
                                label="Nombre del rol *"
                                name="name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                touched={touched.name}
                                type="text"
                                value={values.name}
                              />
                            </Col>
                            <Col md={8}>
                              <FormInput
                                error={errors.description}
                                id="description"
                                key={"description"}
                                label="Descripción"
                                name="description"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                touched={touched.description}
                                type="text"
                                value={values.description}
                              />
                            </Col>
                          </Row>
                                            {/* <pre>{JSON.stringify(values.rights,null,2)}</pre> */}
                          <div className="mt-2">
                            <h5 className="fw-semibold border-bottom pb-1 mb-3">
                              Ceder derechos
                            </h5>
                            {modules.map((module) => (
                              <div key={module.id} className="mb-2 pb-1">
                                <Row>
                                  <Col
                                    md="auto"
                                    className="fw-semibold small custom-min-width-210"
                                  >
                                    {module.name}
                                  </Col>
                                  <Col md>
                                    {module.permissions.map((permission) => (
                                      <Form.Check
                                        className="custom-min-width-120 align-top"
                                        inline
                                        type="checkbox"
                                        label={permission.description}
                                        checked={
                                          values.rights[module.name]?.[
                                            permission.name
                                          ]?.checked || false
                                        }
                                        onChange={(e) => {
                                          
                                          handleCheckboxChange(
                                            e,
                                            module.name,
                                            permission.name,
                                            permission.id,
                                            values,
                                            setFieldValue
                                          )
                                        }}
                                        key={permission.id}
                                      />
                                    ))}
                                  </Col>
                                </Row>
                              </div>
                            ))}
                          </div>
                        </Col>
                      </Row>
                      <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                        <Stack
                          direction="horizontal"
                          gap={3}
                          className="justify-content-end flex-wrap"
                        >
                          <Link
                            to={"/role-rights"}
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
              </Card.Body>
            </Card>
          </div>
      }
    </>
  );
};

export default RoleRightsForm;
