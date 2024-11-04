import React from 'react';

const Select = ({ options, value, onChange, className, placeholder, name }) => {
    return (
            <select
                name={name}
                className={className}
                value={value}
                onChange={onChange}
                placeholder={placeholder}

            >
                {options.map((option) => (
                    <option disabled={option.isDisabled} key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
    );
};

export default Select;