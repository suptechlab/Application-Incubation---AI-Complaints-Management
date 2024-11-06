import { Form as FormikForm, Formik } from "formik";
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card} from 'reactstrap'
import { validationSchema } from '../../validations/states.validation';
import { handleGetStateById, handleAddState, handleUpdateState } from "../../services/state.service";
import Toggle from '../../components/Toggle';
import FormInput from '../../components/FormInput';
import SvgIcons from "../../components/SVGIcons" 
 
export default function AddStatePage() {
 
    const [pageData, setPageData] = useState(null)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
    const params = useParams();
    const { id } = useParams();
    const isEdit = !!id;

    const [initialValues, setInitialValues] = useState({
        stateName: "",
        stateCode: "",
        status: true,
    });

    useEffect(()=>{
        setLoading(false)
    },[])

    useEffect(() => {
        console.log("Called...StateFOrm Use Effect")
        console.log(isEdit);
        if (isEdit) {
            handleGetStateById(id).then(response => {
                setInitialValues({
                    stateName: response.data.data.stateName,
                    stateCode: response.data.data.stateCode ? response.data.data.stateCode : '',
                    status: response.data.data.status,
                });
            });
        }
    }, [id, isEdit]);

    const onSubmit = async (values) => {
        if (isEdit) {
            await handleUpdateState(id, values).then(response=>{
                toast.success(response.data.message);
                navigate("/states");

            }).catch((error) => {
                if(error.response.data.fieldErrors){
                    toast.error(error.response.data.fieldErrors[0].message);
                }else{
                    toast.error(error.response.data.detail);
                }
            })
        } else {
            handleAddState(values).then(response=>{
                console.log("Add State::", response);
                toast.success(response.data.message);
                navigate("/states");

            }).catch((error) => {
                if(error.response.data.fieldErrors){
                    toast.error(error.response.data.fieldErrors[0].message);
                }else{
                    toast.error(error.response.data.detail);
                }
            })
            
        }
        //history.push('/states');
    }
 
    
    return (
        <React.Fragment>
            {loading ? 'Loading...' :
                <Formik
                    initialValues={{
                        title: pageData?.title || '',
                        content: pageData?.content || '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, actions) => {
                       // submitForm(values, actions);
                    }}
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
                                                {isEdit ? "Edit State" : "Add State"}
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
                                                    touched,
                                                    values,
                                                }) => (
                                                    <FormikForm onSubmit={handleSubmit} className="d-flex flex-column h-100 pt-3">
                                                        <Row>
                                                            <Col lg={4} sm={12} xxl={4}>
                                                                <FormInput
                                                                    error={errors.stateName}
                                                                    id="stateName"
                                                                    key={"stateName"}
                                                                    label="State Name *"
                                                                    name="stateName"
                                                                    onBlur={handleBlur}
                                                                    onChange={handleChange}
                                                                    touched={touched.stateName}
                                                                    type="text"
                                                                    value={values.stateName || ""}
                                                                />
                                                                
                                                                <Row>
                                                                    <label className="">Status</label>
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
                                                            <Col lg={4} sm={12} xxl={4}>
                                                                <FormInput
                                                                    error={errors.stateCode}
                                                                    id="stateCode"
                                                                    key={"stateCode"}
                                                                    label="State Code *"
                                                                    name="stateCode"
                                                                    onBlur={handleBlur}
                                                                    onChange={handleChange}
                                                                    touched={touched.stateCode}
                                                                    type="text"
                                                                    value={values.stateCode || ""}
                                                                />
                                                                
                                                                
                                                            </Col>
                                                            
                                                        </Row>
                                                        <br/>
                                                        <div className="theme-from-footer mt-auto border-top px-3 pt-3">
                                                            <Stack
                                                                direction="horizontal"
                                                                gap={3}
                                                                className="justify-content-end px-1"
                                                            >
                                                                <Link
                                                                    to={"/states"}
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
                    )}
 
                </Formik>}
        </React.Fragment>
    )
}
