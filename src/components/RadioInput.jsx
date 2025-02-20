import React from 'react';

export default function RadioInput({ label, options, name, value, onChange, error,touched,wrapperClassName = 'mb-3' }) {
    return (
        <div className={wrapperClassName}>
            {label && <label className='mb-1 fs-14'>{label}</label>}
            <div>
                {options.map((option, index) => (
                    <div key={index} className='form-check form-check-inline'>
                        <input
                            type='radio'
                            id={`${name}-${option.value}`}
                            name={name}
                            value={option.value}
                            checked={value == option.value}
                            onChange={onChange}
                            className='form-check-input'
                        />
                        <label htmlFor={`${name}-${option.value}`} className='form-check-label'>
                            {option.label}
                        </label>
                    </div>
                ))}
                {error && touched ? <div className="form-text text-danger small">{error}</div> : null}
            </div>
        </div>
    );
}
