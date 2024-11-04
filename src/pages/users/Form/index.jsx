import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, Col, Row } from 'reactstrap'
import FormInput from '../../../components/FormInput'
import FormSelect from '../../../components/FormSelect'
import id from '../../../assets/images/id.png'
import ReactSelect from '../../../components/ReactSelect'
import { validationSchema } from '../../../validations/user.validation'
import { handleGetUser, handleUpdateUser } from '../../../services/user.service'
import { Link, useNavigate, useParams } from 'react-router-dom'
import moment from 'moment'
import toast from 'react-hot-toast'
import { Button, Stack } from 'react-bootstrap'
import { HiMiniUsers } from 'react-icons/hi2'

export default function UserForm({
    isEdit
}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [occupations, setOccupations] = useState([])

    const params = useParams()
    const navigate = useNavigate()

   




    useEffect(() => {
        if (isEdit) {
            handleGetUser(params.id).then((res) => {
                setUser(res.data.data)
                setLoading(false)

            })
                .catch((err) => {
                    console.log(err)
                    setLoading(false)
                    navigate('/users')
                })
        }

    }, [])

    const onSubmit = (values, { setSubmitting }) => {
        const data = { ...values }

        data.countryCode = data.phoneNumber.slice(0, 3)
        data.phoneNumber = data.phoneNumber.slice(3)
        handleUpdateUser(params.id, data).then((res) => {
            setSubmitting(false)
            toast.success(res.data.message);
            navigate('/users')
        }).catch((err) => {
            toast.error(err.response.data.message)
        })
        setSubmitting(false)
    }

    const onCancel = () => {
        navigate('/users')
    }


    return (


        <>
        <React.Fragment>
        {loading ? 'Loading...' : <Formik
                    initialValues={{
                        phoneNumber: `${user.countryCode}${user?.phoneNumber}`,
                        name: user?.name,
                        occupation: user?.occupation,
                        freeFor: user?.freeFor,
                        freeTrialStartingFrom: moment(user?.freeTrialStartingFrom).format("DD/MM/YYYY"),
                        pouchScore: user?.pouchScore,
                        status: user?.status
                    }}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
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
                            Users Management
                        </h1>

                        <Link
                            className="btn btn-primary fw-semibold fs-14"
                            to={"#"}
                        >
                            Add New
                        </Link>
                    </Stack>
                </div>
                <div className="flex-grow-1 pageContent position-relative pt-4 overflow-auto">
                    <Card className="h-100 bg-white shadow-lg border-0 theme-card-cover">
                        <div className="theme-card-header px-1">
                            <Stack
                                gap={3}
                                className="flex-wrap px-3 pt-3 pb-2 align-items-start"
                            >
                                <h5 className="mb-0 position-relative fw-semibold fs-16">
                                    <div className="align-items-center bg-info d-inline-flex custom-height-60 justify-content-center position-absolute rounded start-0 text-white theme-icon-box custom-width-60 z-1">
                                        <HiMiniUsers size={32} />
                                    </div>
                                    Admin Users List
                                </h5>
                              
                            </Stack>
                        </div>
                        <div className="flex-grow-1 d-flex flex-column px-3 pb-1 overflow-auto">
                            <div className="p-1 h-100">
                            <div className=''>
          
               <Form>
                        
                        <CardBody>

                            <Col md={8}>
                                <Row>
                                    <Col md={6}>
                                        <FormInput

                                            error={errors.phoneNumber}
                                            id="phoneNumber"
                                            key={'phoneNumber'}
                                            label="Phone Number"
                                            name="phoneNumber"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Enter Name"
                                            touched={touched.phoneNumber}
                                            type="text"
                                            value={values.phoneNumber || ""}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <FormInput

                                            error={errors.name}
                                            id="name"
                                            key={'name'}
                                            label="Name"
                                            name="name"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Enter Name"
                                            touched={touched.name}
                                            type="text"
                                            value={values.name || ""}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <ReactSelect
                                            error={errors.occupation}
                                            id="occupation"
                                            key={'occupation'}
                                            label="Occupation"
                                            name="occupation"
                                            options={occupations}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Enter Name"
                                            touched={touched.occupation}
                                            type="text"
                                            value={values.occupation || ""}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Row>
                                            <Col md={4}>


                                                <FormInput
                                                    disabled
                                                    error={errors.freeFor}
                                                    id="freeFor"
                                                    key={'freeFor'}
                                                    label="Free For"
                                                    name="freeFor"
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    placeholder="Enter Free For"
                                                    touched={touched.freeFor}
                                                    type="text"
                                                    value={values.freeFor || ""}
                                                />
                                            </Col>
                                            <Col>

                                                <FormInput
                                                    disabled
                                                    error={errors.freeTrialStartingFrom}
                                                    id="freeTrialStartingFrom"
                                                    key={'freeTrialStartingFrom'}
                                                    label="Free Trial Starting From"
                                                    name="freeTrialStartingFrom"
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    placeholder="Enter Free Trial Starting From"
                                                    touched={touched.freeTrialStartingFrom}
                                                    type="text"
                                                    value={values.freeTrialStartingFrom || ""}
                                                />
                                            </Col>

                                        </Row>

                                    </Col>
                                    <Col md={6}>
                                        <FormInput
                                            error={errors.pouchScore}
                                            disabled
                                            id="pouchScore"
                                            key={'pouchScore'}
                                            label="Pouch Score"
                                            name="pouchScore"
                                            //    onBlur={handleBlur}
                                            //  onChange={handleChange}
                                            placeholder="Enter Pouch Score"
                                            //  touched={touched.pouchScore}
                                            type="text"
                                            value={values.pouchScore}
                                        />

                                    </Col>
                                    <Col md={12}>
                                        <Col md={6}>
                                            <div className='d-flex justify-content-between status-radio'>
                                                <div><label className='fs-13 fw-bolder'>Status</label>
                                                </div>
                                                <div style={{
                                                    width: "50%",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                }}>

                                                    <label className="form-check-label">
                                                        <input
                                                            className="form-check-input radio-inline"
                                                            type="radio"
                                                            name="status"
                                                            id="status"
                                                            defaultValue="active"
                                                            defaultChecked={values.status === 'active'}
                                                            onClick={handleChange}
                                                        />
                                                        Active
                                                    </label>
                                                    <label className="form-check-label">
                                                        <input
                                                            className="form-check-input radio-inline"
                                                            type="radio"
                                                            name="status"
                                                            id="status"
                                                            defaultValue="inactive"
                                                            defaultChecked={values.status === 'inactive'}
                                                            onClick={handleChange}
                                                        />
                                                        Inactive
                                                    </label>


                                                </div>
                                            </div>

                                        </Col>

                                    </Col>
                                </Row>

                                <Col >
                                    <div className='fs-16 fw-semibold text-info mt-4 pt-2 mb-3'>Student Details</div>
                                    <div className='student-details-cover d-flex justify-content-between align-items-center'>
                                        <div>
                                            <img src={id} />
                                        </div>
                                        <div>
                                            <label>ID Number</label>
                                            <p>S-54865688</p>
                                        </div>
                                        <div>
                                            <label>Grade</label>
                                            <p>B. Sc - 1</p>
                                        </div>
                                        <div>
                                            <label>Email</label>
                                            <p>emmasmith@gmail.com</p>
                                        </div>
                                        <div>
                                            <label>Date of Birth</label>
                                            <p>12/6/2004</p>
                                        </div>
                                    </div>
                                </Col>

                            </Col>

                        </CardBody>
                        
                    </Form>

        
        </div >
                            </div>
                        </div>
                        <CardFooter className='border-0'>
                            <div className='d-flex justify-content-end'>
                                <Button
                                    className="fs-14 fw-semibold me-3"  variant="outline-dark"
                                    type="button"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    className="fs-14 fw-semibold"  variant="primary"
                                    type="submit"
                                >
                                    Update
                                </Button>
                            </div>

                        </CardFooter>
                    </Card>
                </div>
            </div>
            )}

            </Formik>}
            import React, { useState } from "react";
import ReactQuill from "react-quill";
import Form from "react-bootstrap/Form";
import "react-quill/dist/quill.snow.css";
import "./styles.scss";

const TextEditor = ({
  controlId,
  label,
  placeholder,
  handleBlur,
  errorsField,
  touched,
  value,
  disabled,
  setFieldValue,
}) => {
  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
      ["link"], // "image", "video"
      ["clean"],
    ],
  };

  const errorCss = errorsField ? 'show-error' : '';

  return (
    <Form.Group className="mb-3 pb-1" controlId={controlId}>
      <Form.Label className="mb-1 fw-semibold small">{label}</Form.Label>
      <div className="position-relative">
        <ReactQuill          
          theme="snow"
          value={value}
          defaultValue={value}
          placeholder={placeholder}
          onBlur={(event) => {
            console.log("event",event)
          }}
          onChange={(event) => {
            const value = event == '<p><br></p>' ?'':event;
            setFieldValue(controlId, value);
          }}
          readOnly={disabled}
          modules={modules}
        />
        <Form.Control.Feedback type="invalid" className={errorCss}>
          {errorsField}
        </Form.Control.Feedback>
      </div>
    </Form.Group>
  );
};

export default TextEditor;


        </React.Fragment>
    </>
      
    )
}
