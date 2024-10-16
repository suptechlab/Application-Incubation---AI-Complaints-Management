import { Form as FormikForm, Formik } from "formik";
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { Card } from "react-bootstrap";
import FormInput from '../../components/FormInput';
import { validationSchema } from '../../validations/rolerights.validation'; 
import { handleGetRoleRightById, handleAddRoleRight, handleEditRoleRight, fetchModulesAndPermissions } from "../../services/rolerights.service";
import toast from 'react-hot-toast';
import SvgIcons from "../../components/SVGIcons"
const RoleRightsForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [initialValues, setInitialValues] = useState({
        name: "",
        description: "",
        rights: {}
    });

    const [modules, setModules] = useState([]);

    useEffect(() => {
        if (isEdit) {
            handleGetRoleRightById(id).then(response => {
                const roleData = response.data.data;
                const rights = roleData.modules.reduce((acc, module) => {
                    acc[module.name] = module.permissions.reduce((permAcc, permission) => {
                        permAcc[permission.name] = {
                            checked: permission.checked,
                            id: permission.id,
                        };
                        return permAcc;
                    }, {});
                    return acc;
                }, {});

                setInitialValues({
                    name: roleData.name,
                    description: roleData.description,
                    rights: rights,
                });
                setModules(response.data.data.modules);
            });
        } else {
            fetchModulesAndPermissions().then(response => {
                setModules(response.data.data);
            });
        }
    }, [id, isEdit]);

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
    const handleCheckboxChange = (e, module, permission, permissionId, values, setFieldValue) => {
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
        setFieldValue('rights', updatedRights);
    };

    const onSubmit = async (values) => {
        console.log("Values::::", values);
        const permissionIds = Object.keys(values.rights).flatMap(module =>
            Object.keys(values.rights[module])
                .filter(permission => values.rights[module][permission].checked)
                .map(permission => values.rights[module][permission].id)
        );

        const payload = {
            name: values.name,
            description: values.description,
            permissionIds: permissionIds
        };

        if (isEdit) {
            await handleEditRoleRight(id, payload)
                .then(response => {
                    toast.success(response.data.message);
                    navigate("/role-rights");
                })
                .catch(error => {
                    if(error.response.data.fieldErrors){
                        toast.error(error.response.data.fieldErrors[0].message);
                    }else{
                        toast.error(error.response.data.detail);
                    }
                });
        } else {
            handleAddRoleRight(payload)
                .then(response => {
                    toast.success(response.data.message);
                    navigate("/role-rights");
                })
                .catch(error => {
                    if(error.response.data.fieldErrors){
                        toast.error(error.response.data.fieldErrors[0].message);
                    }else{
                        toast.error(error.response.data.detail);
                    }
                });
        }
    };

    const handleCancel = () => {
        navigate("/role-rights");
    };

    return (
        <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
            <div className="contentHeader p-1">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="flex-wrap justify-content-between custom-min-height-42"
                >
                    <h1 className="fw-semibold h4 mb-0 fs-22">
                        Portal Users Management
                    </h1>
                    
                    
                </Stack>
            </div>
            <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover card">
                    
                    <div className="theme-card-header px-1">
                        <Stack
                            gap={3}
                            className="flex-wrap px-3 pt-3 pb-2 align-items-start"
                        >
                            <h5 className="mb-0 position-relative fw-semibold fs-16">
                            <div className="align-items-center bg-black d-inline-flex custom-height-60 justify-content-center position-absolute rounded start-0 text-white theme-icon-box custom-width-60 z-1">
                                <span className='page-header-user-icon'>{SvgIcons.userManagementIcon}</span>
                            </div>
                                {isEdit ? "Edit Role Right" : "Add Role & Rights"}
                            </h5>
                        </Stack>
                    </div>
                    <div className="flex-grow-1 d-flex flex-column px-3 pb-1 pt-3 overflow-auto">
                        <div className="p-1 h-100">
                            <Formik
                                initialValues={initialValues}
                                //validationSchema={validationSchema}
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
                                    <FormikForm onSubmit={handleSubmit} className="d-flex flex-column h-100">
                                         <Row>
                                         <Col lg={12} sm={12} xxl={12}>
                                            <Row>
                                                <Col lg={4} sm={12} xxl={4}>
                                                    <FormInput 
                                                        error={errors.name}
                                                        id="name"
                                                        key={"name"}
                                                        label="Role Name *"
                                                        name="name"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        placeholder="Enter role name"
                                                        touched={touched.name}
                                                        type="text"
                                                        value={values.name}
                                                    />
                                                </Col>
                                                <Col lg={8} sm={12} xxl={8}>
                                                    <FormInput
                                                        error={errors.description}
                                                        id="description"
                                                        key={"description"}
                                                        label="Description"
                                                        name="description"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        placeholder="Enter description"
                                                        touched={touched.description}
                                                        type="text"
                                                        value={values.description}
                                                    />
                                                </Col>
                                            </Row>
                                        

                                        <div className="mt-3">
                                            <h5 className="fs-16 fw-bold assign-title">Assign Rights</h5>
                                            {modules.map(module => (
                                                <div key={module.id} className="mb-3">
                                                    <Row>
                                                    <Col md={4} className="fw-bold fs-14">{module.name}</Col>
                                                    <Col md={8} className="role-chekbox-cover">
                                                        {module.permissions.map(permission => (
                                                            <Form.Check
                                                                inline
                                                                type="checkbox"
                                                                label={permission.description}
                                                                checked={values.rights[module.name]?.[permission.name]?.checked || false}
                                                                onChange={(e) => handleCheckboxChange(e,module.name, permission.name, permission.id, values, setFieldValue)}
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
                                        <div className="theme-from-footer mt-auto border-top px-3 pt-3">
                                            <Stack
                                                direction="horizontal"
                                                gap={3}
                                                className="justify-content-end px-1"
                                            >
                                                <Link
                                                    to={"/role-rights"}
                                                    className="btn btn-outline-dark fs-14"
                                                >
                                                    Cancel
                                                </Link>
                                                <Button type="submit" className="fs-14">
                                                    {isEdit ? 'Update' : 'Submit'}
                                                </Button>
                                            </Stack>
                                        </div>

                                        
                                    </FormikForm>
                                )}
                            </Formik>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
   
export default RoleRightsForm;
