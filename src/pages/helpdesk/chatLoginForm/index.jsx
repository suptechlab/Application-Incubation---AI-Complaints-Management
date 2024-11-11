import React from 'react';
import { Button, Col, Offcanvas, Row } from 'react-bootstrap';
import CommonFormikComponent from '../../../components/CommonFormikComponent';
import FormInputBox from '../../../components/FormInput';
import HelpDeskHeader from '../chatHeader';
import { ChatLoginFormSchema } from '../validations';

const ChatLoginForm = ({ onSubmit }) => {
    // Initial Values
    const initialValues = {
        name: '',
        nationalId: '',
        email: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        onSubmit(values, actions);
    };

    return (
        <React.Fragment>
            <HelpDeskHeader />
            <CommonFormikComponent
                validationSchema={ChatLoginFormSchema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <Offcanvas.Body className="text-break d-flex flex-column small p-0">
                        {/* Chatbot Body */}
                        <div className='chatbot-body d-flex flex-column flex-grow-1 overflow-auto px-3'>
                            <FormInputBox
                                wrapperClassName="mb-2 pb-1"
                                id="name"
                                label="Your Name"
                                name="name"
                                error={formikProps.errors.name}
                                onBlur={formikProps.handleBlur}
                                onChange={formikProps.handleChange}
                                touched={formikProps.touched.name}
                                type="text"
                                value={formikProps.values.name || ""}
                            />
                            <FormInputBox
                                wrapperClassName="mb-2 pb-1"
                                id="nationalId"
                                label="Your National ID"
                                name="nationalId"
                                error={formikProps.errors.nationalId}
                                onBlur={formikProps.handleBlur}
                                onChange={formikProps.handleChange}
                                touched={formikProps.touched.nationalId}
                                type="text"
                                value={formikProps.values.nationalId || ""}
                                autoComplete="off"
                            />
                            <FormInputBox
                                wrapperClassName="mb-2 pb-1"
                                id="email"
                                label="Your Email"
                                name="email"
                                error={formikProps.errors.email}
                                onBlur={formikProps.handleBlur}
                                onChange={formikProps.handleChange}
                                touched={formikProps.touched.email}
                                type="email"
                                value={formikProps.values.email || ""}
                                autoComplete="off"
                            />
                        </div>

                        {/* Chatbot Body Footer */}
                        <div className='chatbot-body-footer p-3'>
                            <Row direction="horizontal" className="justify-content-end gx-3">
                                <Col xs={6}>
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        className="w-100"
                                    >
                                        Next  &gt;
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

export default ChatLoginForm