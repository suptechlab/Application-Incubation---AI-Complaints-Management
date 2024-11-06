import React from 'react'
import Input from './Input'
import TextArea from './TextArea'
import AppTooltip from './tooltip'
import { Button } from 'react-bootstrap'
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function FormInput({ label, touched, error, isTextarea, wrapperClassName = 'mb-3 pb-1', ...rest }) {
    const [showPassword, setShowPassword] = React.useState(false)
    
    return (
        <div className={wrapperClassName || ''}>
            {label ? <label className='mb-1 fs-14' htmlFor={rest.id}>{label}</label> : ""}

            {isTextarea ? (
                <TextArea
                    className={`form-control ${touched && error ? "is-invalid" : ""}`}
                    {...rest}
                />
            ) : (
                <div className='position-relative'>
                    <Input
                        className={`form-control ${touched && error ? "is-invalid" : ""}`}
                        {...rest}
                        type={rest.type === 'password' && showPassword ? 'text' : rest.type}
                    />
                    {rest.type === 'password' && (
                        <AppTooltip title={showPassword ? "Hide Password" : "Show Password"} placement="top">
                            <Button
                                variant='link'
                                type="button"
                                className="position-absolute top-50 end-0 translate-middle-y h-100 link-secondary px-2"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide Password" : "Show Password"}

                            >
                                {showPassword ? <MdVisibilityOff size={20} className='mx-1' /> : <MdVisibility size={20} className='mx-1' />}
                            </Button>
                        </AppTooltip>
                    )}
                </div>
            )}

            {touched && error && <small className="form-text text-danger">{error}</small>}
        </div>
    )
}
