import { Form, Formik } from "formik";
import React, { useState } from 'react';
import { Button, Card, Stack } from "react-bootstrap";
import { MdAttachFile } from "react-icons/md";
import { Link } from "react-router-dom";
import SunEditorReact from '../../../../../components/SuneditorReact';
import { validationSchema } from '../../../../../validations/ticketsManagement.validation';

const ReplyTab = () => {
    const [fileName, setFileName] = useState("");

    //Handle File Change
    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("Fi_Users_data.xlsx");
        }
    };

    // Handle Submit
    const handleSubmit = (values, actions) => {
        actions.setSubmitting(false);
        console.log("values::", values);
    };

    return (
        <Formik
            initialValues={{
                description: "",
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
        >
            {({
                handleChange,
                handleBlur,
                values,
                setFieldValue,
                setFieldError,
                touched,
                isValid,
                errors,
            }) => (
                <Form>
                    <SunEditorReact
                        wrapperClassName="mb-0 editor-for-tab-view overflow-hidden"
                        id="description"
                        name="description"
                        height="100"
                        content={values.description}
                        error={errors?.description}
                        touched={touched?.description}
                        handleBlur={handleBlur}
                        handleChange={(value) => {
                            if (value === "<p><br></p>") {
                                setFieldValue("description", "");
                            } else {
                                setFieldValue("description", value);
                            }
                        }}
                    />
                    {fileName && (
                        <div className='px-3 py-1'>
                            <Link
                                target="_blank"
                                to="/fi-users/import"
                                className="text-decoration-none small mw-100 text-break"
                            >
                                {fileName}
                            </Link>
                        </div>
                    )}
                    <Card.Footer className='bg-body py-3'>
                        <Stack direction='horizontal' gap={2} className='flex-wrap'>
                            <div className="overflow-hidden position-relative z-1 flex-shrink-0 me-auto">
                                <label
                                    htmlFor="files"
                                    className="small link-info align-middle cursor-pointer"
                                >
                                    <span className='align-text-bottom'><MdAttachFile size={16} /></span> Add attachment
                                </label>
                                <input
                                    id="files"
                                    accept="image/png, image/jpeg, image/jpg"
                                    className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <Stack direction='horizontal' gap={2} className='flex-wrap justify-content-between justify-content-sm-end flex-fill'>
                                <Button
                                    type='button'
                                    size="sm"
                                    variant='outline-dark'
                                >
                                    Reply to Customer
                                </Button>
                                <Button
                                    type='submit'
                                    size="sm"
                                    variant='warning'
                                >
                                    Reply Internally
                                </Button>
                            </Stack>
                        </Stack>
                    </Card.Footer>
                </Form>
            )}
        </Formik>
    )
}

export default ReplyTab