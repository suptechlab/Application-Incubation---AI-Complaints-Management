import { Form as FormikForm, Formik } from "formik";
import React, { useEffect, useState } from 'react';
import {Link,  useParams, useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import FormInput from '../../components/FormInput';
import Toggle from '../../components/Toggle';
import ReactSelect from '../../components/ReactSelect';
import { validationSchema } from '../../validations/districts.validation';
import { handleGetDistrictById, handleAddDistrict, handleEditDistrict } from "../../services/district.service";
import { handleGetStates } from "../../services/state.service"; // Add this import for fetching states
import toast from 'react-hot-toast';
import Select from 'react-select';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import SvgIcons from "../../components/SVGIcons"

const DistrictForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [initialValues, setInitialValues] = useState({
        districtName: "",
        districtCode: "",
        status: true,
        stateId: "", // Add stateId to initial values
    });

    const [states, setStates] = useState([]);

    useEffect(() => {
        handleGetStates().then(response => {
            setStates(response.data.data.map(state => ({
                value: state.id,
                label: state.stateName
            })));
        });

        if (isEdit) {
            handleGetDistrictById(id).then(response => {
                setInitialValues({
                    districtCode: response.data.data.districtCode ? response.data.data.districtCode : '',
                    districtName: response.data.data.districtName,
                    status: response.data.data.status,
                    stateId: response.data.data.stateId, // Initialize stateId if editing
                });
            });
        }
    }, [id, isEdit]);

    const onSubmit = async (values) => {
        if (isEdit) {
            values.id = id
            await handleEditDistrict(id, values).then(response => {
                toast.success(response.data.message);
                navigate("/districts");
            }).catch((error) => {
                if(error.response.data.fieldErrors){
                    toast.error(error.response.data.fieldErrors[0].message);
                }else{
                    toast.error(error.response.data.detail);
                }
            });
        } else {
            console.log("Log Value:::", values)
            handleAddDistrict(values).then(response => {
                toast.success(response.data.message);
                navigate("/districts");
            }).catch((error) => {
                if(error.response.data.fieldErrors){
                    toast.error(error.response.data.fieldErrors[0].message);
                }else{
                    toast.error(error.response.data.detail);
                }
            });
        }
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
                        Master Management
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
                                <span className='page-header-icon'>{SvgIcons.mastermanage}</span>
                                </div>
                                {isEdit ? "Edit District" : "Add District"}
                            </h5>
                        </Stack>
                    </div>
                    <div className="flex-grow-1 d-flex flex-column px-3 pb-1  overflow-auto">
                        <div className="p-1 h-100">
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
                                    setFieldValue,
                                    touched,
                                    values,
                                }) => (
                                    <FormikForm onSubmit={handleSubmit} className="d-flex flex-column h-100 pt-3">
                                        <Row>
                                            <Col lg={8} sm={12} xxl={8}>
                                                <Row>
                                                    <Col lg={6} sm={12} xxl={4} className="pad-right-70">
                                                        <FormInput
                                                            error={errors.districtName}
                                                            id="districtName"
                                                            key={"districtName"}
                                                            label="District Name *"
                                                            name="districtName"
                                                            onBlur={handleBlur}
                                                            onChange={handleChange}
                                                            touched={touched.districtName}
                                                            type="text"
                                                            value={values.districtName || ""}
                                                        />
                                                    </Col>
                                                    <Col lg={6} sm={12} xxl={4}>
                                                        <ReactSelect
                                                            error={errors.stateId}
                                                            options={states}
                                                            value={values.stateId}
                                                            onChange={(option) => { setFieldValue('stateId', option?.target?.value ?? '') }}
                                                            name="stateId"
                                                            label="State *"
                                                            className={touched.stateId && errors.stateId ? "is-invalid" : ""}
                                                            onBlur={handleBlur}
                                                            touched={touched.stateId}

                                                        />
                                                    </Col>
                                                    <Col lg={6} sm={12} xxl={4}>
                                                    <FormInput
                                                            error={errors.districtCode}
                                                            id="districtCode"
                                                            key={"districtCode"}
                                                            label="District Code *"
                                                            name="districtCode"
                                                            onBlur={handleBlur}
                                                            onChange={handleChange}
                                                            touched={touched.districtCode}
                                                            type="text"
                                                            value={values.districtCode || ""}
                                                        />
                                                    </Col>
                                                </Row>
                                            
                                                <Row>
                                                    <label className="mb-1 fs-14">Status</label>
                                                    <Toggle
                                                        id="status"
                                                        key={"status"}
                                                        label=""
                                                        name="status"
                                                        onChange={handleChange}
                                                        value={values.status}
                                                    />
                                                </Row>
                                            </Col>
                                        </Row>
                                        <div className="theme-from-footer mt-auto border-top px-3 pt-3">
                                            <Stack
                                                direction="horizontal"
                                                gap={3}
                                                className="justify-content-end px-1"
                                            >
                                                <Link
                                                    to={"/districts"}
                                                    className="btn btn-outline-dark fs-14"
                                                >
                                                    Cancel
                                                </Link>
                                                <Button type="submit" className="">
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

export default DistrictForm;
