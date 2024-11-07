import React from 'react';
import { Button, Col, Offcanvas, Row } from 'react-bootstrap';
import CommonFormikComponent from '../../../components/CommonFormikComponent';
import FormCheckbox from '../../../components/formCheckbox';
import SvgIcons from '../../../components/SVGIcons';
import PrivacyData from '../../auth/privacy/privacyData';
import { PrivacyFormSchema } from '../validations';

const PrivacyForm = ({ handleClose, onSubmit }) => {
    // Initial Values
    const initialValues = {
        agreePrivacy: false,
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        onSubmit(values, actions);        
    };

    return (
        <React.Fragment>
            <Offcanvas.Header closeButton className='border-bottom mb-4 align-items-start'>
                <Offcanvas.Title as="div" className="d-flex gap-2 align-items-center">
                    <span className='align-items-center bg-warning custom-height-80 custom-width-80 d-inline-flex justify-content-center rounded-pill text-white'>
                        {SvgIcons.RobotIcon(40, 40)}
                    </span>
                    <div className='text-uppercase'>
                        <h5 className='custom-font-size-18 lh-sm mb-0 text-custom-gray'>Welcome to the </h5>
                        <h4 className='custom-font-size-26 lh-sm mb-0'>SEPS Helpdesk</h4>
                    </div>
                </Offcanvas.Title>
            </Offcanvas.Header>
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
                                <h5 className='custom-font-size-18 fw-semibold'>Your Privacy Matters</h5>
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