import React from 'react'
import Input from './Input'
import TextArea from './TextArea'
import AppTooltip from './tooltip'
import { Button } from 'react-bootstrap'
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import AutoResizeTextArea from './AutoResizeTextArea'
import { FiInfo } from 'react-icons/fi';

export default function FormInputBox({ label, touched, error, isTextarea, wrapperClassName = 'mb-3', ref, autoResize, inputClassName, inputIcon, helperText, ...rest }) {
    const [showPassword, setShowPassword] = React.useState(false)

    let TextAreaComponent = null;

    if (isTextarea) {
        TextAreaComponent = autoResize ? AutoResizeTextArea : TextArea;
    }


    return (
        <div className={wrapperClassName || ''}>
            {label ? <label className='mb-1 fs-14' htmlFor={rest.id}>{label}
               {helperText && <AppTooltip
                    title={helperText}
                >
                    <Button
                        type="button"
                        variant="link"
                        className="p-0 mb-1 ms-1 border-0 text-muted"
                    >
                        <FiInfo size={16} />
                    </Button>
                </AppTooltip>}
            </label> : ""}

            {isTextarea ? (
                TextAreaComponent && (
                    <TextAreaComponent
                        {...rest}
                        className={`form-control ${inputClassName || ''} ${touched && error ? "is-invalid" : ""}`}
                    />
                )


            ) : (
                <div className='position-relative'>
                    <Input
                        className={`${touched && error ? "is-invalid" : ""} ${inputClassName || ''}`}
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
                    {inputIcon}
                </div>
            )}
            {/* {!touched && !error && helperText && <small className="form-text text-muted"><FiInfo className='mb-1' /> {helperText}</small>} */}
            {touched && error && <small className="form-text text-danger">{error}</small>}
        </div>
    )
}
