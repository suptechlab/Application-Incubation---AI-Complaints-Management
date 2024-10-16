import React from 'react'
import Input from './Input'

import "./FormInput.scss"

export default function FormInput({ label, touched, error, ...rest }) {
    const [showPassword, setShowPassword] = React.useState(false)
    return (
        <div class=" mb-3 position-relative w-100">

            {rest.type === 'password' ?
                <>
                    {label ? <label className='mb-1 fs-14' htmlFor={rest.id}>{label}</label> :""}
                    <Input
                        className={`form-control ${touched && error ? "is-invalid" : ""}`}
                        {...rest}
                        type={rest.type === 'password' && showPassword ? 'text' : rest.type}

                    />
                    
                    {rest.type === 'password' && rest.value.length > 0 ? <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-icon`} onClick={() => setShowPassword(!showPassword)}></i> : ""}
                </>
                :
                <>
                {label ? <label className='mb-1 fs-14' htmlFor={rest.id}>{label}</label> : ""}
                    <Input
                        className={`form-control ${touched && error ? "is-invalid" : ""}`}
                        {...rest}
                        type={rest.type === 'password' && showPassword ? 'text' : rest.type}


                    />
                    
                </>

            }
            {
                touched && error && <small id="emailHelp" className="form-text text-danger">{error}</small>
            }

        </div>
    )
}
