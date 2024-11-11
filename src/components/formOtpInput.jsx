import React from 'react'
import OTPInput from 'react-otp-input'

export default function FormOtpInputBox({ label, touched, error, wrapperClassName = 'mb-3 pb-1', ...rest }) {
    return (
        <div className={wrapperClassName || ''}>
            {label ? <label className='mb-1 fs-14' htmlFor={rest.id}>{label}</label> : ""}
            <OTPInput
                renderInput={(props) => (
                    <input {...props} className={`form-control ${touched && error ? "is-invalid" : ""}`} />
                )}
                containerStyle={{
                    justifyContent: "space-between"
                }}
                {...rest}
            />
            {touched && error && <div className="form-text text-danger">{error}</div>}
        </div>
    )
}
