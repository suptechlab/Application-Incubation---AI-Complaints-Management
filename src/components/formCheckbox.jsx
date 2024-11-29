import React from 'react';
import { Form } from 'react-bootstrap';

export default function FormCheckbox({ touched, error, wrapperClassName = 'mb-3', inputClassName, label, ...rest }) {
    return (
        <div className={wrapperClassName}>
            <Form.Check
                isInvalid={touched && error}
                label={label}
                {...rest}
            />
            {touched && error && (
                <div className="form-text text-danger fs-14">{error}</div>
            )}
        </div>
    );
}