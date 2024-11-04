import React from 'react';
import Select from './Select';

const FormSelect = ({
    label,
    options,
    value,
    onChange,
    id,
    touched,
    error
}) => {
    return (
        <div className='mb-4'>
            {label ? <label className='mb-1 fs-14' htmlFor={id}>{label}</label> : ""}
            <Select
                name={id}
                className={"form-control"}
                id={id}
                options={options}
                value={value}
                onChange={onChange}
            />
            {touched && error && <div className="text-danger">{error}</div>}
        </div>
    );
};

export default FormSelect;