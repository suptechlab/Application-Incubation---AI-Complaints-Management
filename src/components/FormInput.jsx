import React from 'react'
import Input from './Input'

import "./FormInput.scss"
import TextArea from './TextArea'

export default function FormInput({ label, touched, error, isTextarea, ...rest }) {
    const [showPassword, setShowPassword] = React.useState(false)
    
    return (
        <div className="mb-3 position-relative w-100">
            {label ? <label className='mb-1 fs-14' htmlFor={rest.id}>{label}</label> : ""}

            {isTextarea ? (
                <TextArea
                    className={`form-control ${touched && error ? "is-invalid" : ""}`}
                    {...rest}
                />
            ) : (
                <>
                    <Input
                        className={`form-control ${touched && error ? "is-invalid" : ""}`}
                        {...rest}
                        type={rest.type === 'password' && showPassword ? 'text' : rest.type}
                    />
                    {rest.type === 'password' && rest.value.length > 0 && (
                        <i
                            className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-icon`}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    )}
                </>
            )}

            {touched && error && <small className="form-text text-danger">{error}</small>}
        </div>
    )
}
