import React, { act } from 'react';
import { Button, Col, Offcanvas, Row } from 'react-bootstrap';
import CommonFormikComponent from '../../../components/CommonFormikComponent';
import FormCheckbox from '../../../components/formCheckbox';
import PrivacyData from '../../auth/privacy/privacyData';
import HelpDeskHeader from '../chatHeader';
import { PrivacyFormSchema } from '../validations';

const PrivacyForm = ({ handleClose, onSubmit }) => {



    // Initial Values
    const initialValues = {
        agreePrivacy: false ,
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        actions?.setSubmitting(true)
        onSubmit(values, actions);  
    };

 
 

    return (
        <React.Fragment>
            <HelpDeskHeader />
            <CommonFormikComponent
                validationSchema={PrivacyFormSchema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <Offcanvas.Body className="text-break d-flex flex-column small p-0">
                        {/* Chatbot Body */}
                        <div className='chatbot-body d-flex flex-column flex-grow-1 overflow-auto px-3'>
                            <div className='chatbot-body-inner flex-grow-1 overflow-auto mx-n3 px-3'>
                                <div className='custom-font-size-18 fw-semibold mb-2'>Your Privacy Matters</div>
                                <PrivacyData />
                            </div>
                            <div className='pt-2'>
                                <FormCheckbox
                                    wrapperClassName="mb-0"
                                    className='fs-6 fw-semibold'
                                    id="agreePrivacy"
                                    checked={formikProps.values.agreePrivacy}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.agreePrivacy}
                                    error={formikProps.errors.agreePrivacy}
                                    type="checkbox"
                                    label="I agreed to the data protection and privacy terms"
                                />
                            </div>
                        </div>

                        {/* Chatbot Body Footer */}
                        <div className='chatbot-body-footer p-3'>
                            <Row direction="horizontal" className="justify-content-end gx-3">
                                <Col xs={6}>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleClose}
                                        className="w-100"
                                    >
                                        Decline
                                    </Button>
                                </Col>
                                <Col xs={6}>
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        className="w-100"
                                        disabled={formikProps?.isSubmitting ?? false}
                                    >
                                        Accept
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Offcanvas.Body>
                )}
            </CommonFormikComponent>
        </React.Fragment>
    )
}

export default PrivacyForm