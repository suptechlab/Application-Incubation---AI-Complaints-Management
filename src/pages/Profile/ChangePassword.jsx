import { Formik } from 'formik'
import React from 'react'
import toast from 'react-hot-toast'

import FormInput from '../../components/FormInput'
import { handleChangePassword } from '../../services/authentication.service'
import { validationSchema } from '../../validations/changePassword.validation'

import "./ChangePassword.scss"

export default function ChangePassword() {
    const onSubmit = async (values, actions) => {
        await handleChangePassword(values).then((response) => {
            toast.success(response.data.message)
            actions.resetForm()
        }).catch((error) => {
            actions.resetForm()
        })
    }

    return (

        < div className='col-4'>
            <div className="content-header">
                <h1>Change Password</h1>
            </div>
            <div className="content px-2">
                <Formik
                    initialValues={{
                        newPassword: "",
                        confirmPassword: ""
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
                        <>


                            <FormInput
                                error={errors.newPassword}
                                id="newPassword"
                                key={'newPassword'}
                                label="New Password"
                                name="newPassword"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Enter New password"
                                touched={touched.newPassword}
                                type="password"
                                value={values.newPassword}
                            />

                            <FormInput
                                error={errors.confirmPassword}
                                id="confirmPassword"
                                key={'confirmPassword'}
                                label="Confirm Password"
                                name="confirmPassword"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Enter confirm password"
                                touched={touched.confirmPassword}
                                type="password"
                                value={values.confirmPassword}
                            />

                            <button type="submit" className="btn btn-primary mt-2" disabled={isSubmitting} onClick={handleSubmit}>
                                {isSubmitting ? (
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                ) : (
                                    "Change Password"
                                )}
                            </button>
                        </>
                    )}
                </Formik>
            </div>
        </div>


    );
}
