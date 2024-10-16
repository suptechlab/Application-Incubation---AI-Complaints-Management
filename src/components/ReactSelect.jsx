import React from 'react';
import Select from 'react-select';

import "./ReactSelect.scss";
import SvgIcons from './SVGIcons';

const ReactSelect = ({ options, value, onChange, className, name, label,placeholder ,error, defaultValue=null}) => {
    const customStyles = {
        control: (base) => ({
            ...base,
            height: 'calc(1.5em + .75rem + 2px)', // Adjust to match form-control height
            minHeight: '38px', // Adjust to match form-control min-height
        }),
    };

    const formattedOptions = options.map(option => ({
        value: option.value,
        label: option.label,
        isDisabled: option.isDisabled,
    }));

    const selectedOption = formattedOptions.find(opt => opt.value === value);



    return (
        <div className={` ${className}`}>
            {label ? (
            <label htmlFor={name} className={selectedOption ? 'active mb-1 fs-14' : 'mb-1 fs-14'}>
                {label}
            </label>
            ) : ""}
            <Select
                styles={customStyles}
                name={name}
                value={selectedOption}
                onChange={(option) => onChange({ target: { name, value: option ? option.value : '' } })}
                options={formattedOptions}
                placeholder={placeholder}
                //placeholder=""
                isClearable={selectedOption?.value != '' ? true : false}
                classNamePrefix="react-select"
                defaultValue={defaultValue}
                className={`react-select-container ${selectedOption ? 'has-value' : ''}`}
                components={{
                    // ClearIndicator: () => null,
                    DropdownIndicator: () => (
                        <div className="react-select__dropdown-indicator p-2">
                            {SvgIcons.reactSelectArrow}
                        </div>
                    ),
                    IndicatorSeparator: () => null,
                }}
            />
           {error ? (<div className="text-danger">{error}</div>) : null}
        </div>
    );
};

export default ReactSelect;
