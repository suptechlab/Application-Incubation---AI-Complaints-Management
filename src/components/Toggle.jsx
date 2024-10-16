import React from 'react';
import { FormCheck } from 'react-bootstrap';

const Toggle = ({ id, label, name, onChange, value }) => {
    return (
        <div className="form-group">
            <FormCheck
                type="switch"
                id={id}
                name={name}
                label={label}
                checked={value}
                onChange={onChange}
            />
        </div>
    );
};

export default Toggle;
