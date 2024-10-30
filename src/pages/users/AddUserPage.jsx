import { Form as FormikForm, Formik } from "formik";
import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from 'reactstrap';
import { validationSchema } from '../../validations/user.validation';
import SvgIcons from "../../components/SVGIcons" 
import {
    handleGetUserById,
    handleAddUser,
    handleUpdateUser,
    handleGetCompany,
    handleGetRole,
    handleUserResetPassword,
    handleGetUserCompany
} from "../../services/user.service";
import Toggle from '../../components/Toggle';
import FormInput from '../../components/FormInput';
import { HiMiniUsers } from "react-icons/hi2";
import FormSelect from "../../components/FormSelect";
import axios from "axios";
import { getLocalStorage } from "../../utils/storage";
import defaultImage from "../../assets/images/broken_image.png";
import { useTranslation } from "react-i18next"

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
        { label: "+91", value: '+91' }
    ]);
    const [userData, setUserData] = useState([])
    const [isImageSet,setIsImageSet] = useState(false)
    const [emailDisabled, setEmailDisabled] = useState(false)
    const { t } = useTranslation()
    const editUserValues = [];

     

    useEffect(() => {
        handleGetUserCompany().then(response => {
            let companiesList = [{ value: '', label: 'Select company' }];
            if (response.data?.data?.length > 0) {
                response.data?.data?.forEach((category) => {
                    companiesList.push({ value: category?.id, label: category?.title });
                });
            }
            setCompanyOptions(companiesList);
        });
    
        handleGetRole().then(response => {
            let roleList = [{ value: '', label: 'Select role' }];
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
            lastName:   userData?.lastName ? userData?.lastName : "",
            email: userData?.email ? userData?.email : "",
            mobileCode:"+91",
            mobileNo: userData?.mobileNo ? userData?.mobileNo : "",
            roleId: userData?.roleId ? userData?.roleId : "",
            companyId: userData?.companyId ? userData?.companyId : companyOptions[0],
            activated: userData?.activated ? userData?.activated : false,
            profileImage: userData?.imageUrl ? userData?.imageUrl : "",
    }

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            handleGetUserById(id).then(response => {
                setUserData(response.data.data)
                setEmailDisabled(response.data.data.email == '' ? false  : true)
               
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
                setImageUrl(response.data.data?.imageUrl)
                setLoading(false);
            });
        }else{
            setLoading(false)
        }
    }, [id, isEdit]);

    const onSubmit = async (values) => {
        const formData = new FormData();
        if(!isImageSet){
            delete values.profileImage;
        }
        for (const key in values) {
            formData.append(key, values[key]);
        }

        try {
            if (isEdit) {
                formData.append('id', id);
                const response = await handleUpdateUser(id, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success(response.data.message);
                navigate("/users");
            } else {
                const response = await handleAddUser(formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success(response.data.message);
                navigate("/users");
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleUploadImage = (event, setFieldValue) => {
        console.log('file type', event.target.files[0].type)
        
        const file = event.target.files[0];
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        
        if (!validTypes.includes(file.type)) {
            return toast.error('Please select only png, jpg and jpeg file.');
        }
        setFieldValue("profileImage", file);
        if (event.target.files && event.target.files.length > 0) {
            //setImageUrl(event.target.files[0]);// Image Preview
            setImageUrl(URL.createObjectURL(event.target.files[0])); // Image Preview
        }
        setIsImageSet(true)
        //setImageUrl(event.target.files[0]) // Image Preview
    };

    const ResetPassword = async () => {
        //setLoading(true)
        handleUserResetPassword(id).then(response => {
            //setLoading(false)
            toast.success(response.data.message);
            //navigate("/users");

        }).catch((error) => {
            //setLoading(false)
            toast.error(error.response.data.message);
        })
    }

    
    return (
        <React.Fragment>
            {loading ? 'Loading...' :
                 <div className="d-flex flex-column pageContainer p-3 h-100 overflow-auto">
                            
                 <div className="contentHeader p-1">
                     <Stack
                         direction="horizontal"
                         gap={2}
                         className="flex-wrap justify-content-between custom-min-height-42"
                     >
                         <h1 className="fw-semibold h4 mb-0 fs-22">
                                {t('ROLES AND RIGHTS LIST')}
                         </h1>
                         {isEdit ? <button onClick={ResetPassword}
                             className="fw-semibold fs-14 bg-white  text-decoration-none rounded-2 p-2 text-center" type="button" variant="info" >
                             Reset Password</button> : ''}
                         
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
                                     {isEdit ? "Edit Portal User" : "Add New Portal User"}
                                 </h5>
                             </Stack>
                         </div>
                         <div className="flex-grow-1 d-flex flex-column px-3 pb-1 pt-3 overflow-auto">
                             <div className="p-1 h-100">
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
                                         <FormikForm onSubmit={handleSubmit} className="d-flex flex-column h-100">
                                            
                                            {/* values <pre>{JSON.stringify(values,null,2)}</pre>
                                            errors <pre>{JSON.stringify(errors,null,2)}</pre> */}
                                              <Row>
                                                 <Col lg={7} sm={12} xxl={7}>
                                                     <Row>
                                                        <Col sm={6} className="pad-right-70">
                                                             <FormInput
                                                                 error={errors.firstName}
                                                                 id="firstName"
                                                                 key={"firstName"}
                                                                 label="First Name *"
                                                                 name="firstName"
                                                                 onBlur={handleBlur}
                                                                 onChange={handleChange}
                                                                 placeholder="Enter first name"
                                                                 touched={touched.firstName}
                                                                 type="text"
                                                                 value={values.firstName || ""}
                                                             />
                                                         </Col>
                                                         
                                                     </Row>
                                                     <Row>
                                                         <Col sm={6} className="pad-right-70">
                                                             <FormInput
                                                                 error={errors.email}
                                                                 id="email"
                                                                 key={"email"}
                                                                 label="Email Address *"
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
                                                         <Col sm={6} className="pad-left-70">
                                                             <Row>
                                                                <Col md={12}>
                                                                    <label className="mb-1 fs-14">Mobile Number *</label>
                                                                </Col>
                                                                 <Col md={12} className="d-flex">
                                                                     <div className="phone-country-code">
                                                                         <FormSelect
                                                                             id="mobileCode"
                                                                             key="mobileCode"
                                                                             label=""
                                                                             name="mobileCode"
                                                                             placeholder="Code"
                                                                             options={countryCodeData}
                                                                             touched={touched.mobileCode}
                                                                             onBlur={handleBlur}
                                                                             onChange={handleChange}
                                                                             error={errors.mobileCode}
                                                                             value={values.mobileCode}
                                                                         />
                                                                     </div>
                                                                     <FormInput
                                                                         error={errors.mobileNo}
                                                                         id="mobileNo"
                                                                         key={"mobileNo"}
                                                                         label=""
                                                                         name="mobileNo"
                                                                         onBlur={handleBlur}
                                                                         onChange={handleChange}
                                                                         placeholder="Enter mobile number"
                                                                         touched={touched.mobileNo}
                                                                         type="text"
                                                                         value={values.mobileNo || ""}
                                                                     />
                                                                 </Col>
                                                             </Row>
                                                         </Col>
                                                     </Row>
                                                     <Row>
                                                         <Col sm={6} className="pad-right-70">
                                                             <FormSelect
                                                                 id="companyId"
                                                                 key="companyId"
                                                                 label="Company *"
                                                                 name="companyId"
                                                                 placeholder="Company"
                                                                 options={companyOptions}
                                                                 touched={touched.companyId}
                                                                 onBlur={handleBlur}
                                                                 onChange={handleChange}
                                                                 error={errors.companyId}
                                                                 value={values.companyId}
                                                             />
                                                         </Col>
                                                         <Col sm={6} className="pad-left-70">
                                                             <FormSelect
                                                                 id="roleId"
                                                                 key="roleId"
                                                                 label="Role *"
                                                                 name="roleId"
                                                                 placeholder="Role Type"
                                                                 options={rolesOptions}
                                                                 touched={touched.roleId}
                                                                 onBlur={handleBlur}
                                                                 onChange={handleChange}
                                                                 error={errors.roleId}
                                                                 value={values.roleId}
                                                             />
                                                         </Col>
                                                     </Row>
                                                 </Col>
                                                 {/* <Col lg={5} sm={12} xxl={4} className="d-flex justify-content-end">
                                                     <div className="profile-right-width">
                                                         <label>Image</label>
                                                         <div className="d-flex align-items-end">
                                                             <div className="image-outer">
                                                                 <img
                                                                     className="img-fluid"
                                                                     src={imageUrl !=null  ? imageUrl : defaultImage}
                                                                     alt=""
                                                                 />
                                                             </div>
                                                             <label className="custom-upload-btn">
                                                                 <input
                                                                     type="file"
                                                                     name="profileImage"
                                                                     accept=".jpg, .jpeg, .png"
                                                                     onChange={(e) => handleUploadImage(e, setFieldValue)}
                                                                 />
                                                                 <button type="button" className="btn btn-outline-dark ms-3">Upload</button>
                                                             </label>
                                                         </div>
                                                     </div>
                                                 </Col> */}
                                             </Row>
                                             <Row>
                                                <label className="">Status</label>
                                                 <Toggle
                                                     id="activated"
                                                     key={"activated"}
                                                     label=""
                                                     name="activated"
                                                     onChange={handleChange}
                                                     value={values.activated}
                                                 />
                                             </Row>
                                             <br />
                                             <div className="theme-from-footer mt-auto border-top px-3 pt-3">
                                                 <Stack
                                                     direction="horizontal"
                                                     gap={3}
                                                     className="justify-content-end px-1"
                                                 >
                                                     <Link
                                                         to={"/users"}
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
            }
        </React.Fragment>
    );
}
