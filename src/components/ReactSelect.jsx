import React from 'react';
import Select from 'react-select';

import "./ReactSelect.scss";
import { MdArrowDropDown } from 'react-icons/md';

const ReactSelect = ({ options, value, onChange, className = 'mb-3 pb-1', name, label,placeholder ,error, defaultValue=null}) => {
    const customStyles = {
        control: (base) => ({
            ...base,
            // height: 'calc(1.5em + .75rem + 2px)',
            // minHeight: '38px', 
        }),
    };

    const formattedOptions = options.map(option => ({
        value: option.value,
        label: option.label,
        isDisabled: option.isDisabled,
    }));

    const selectedOption = formattedOptions.find(opt => opt.value === value);



    return (
        <div className={className || ''}>
            {label ? <label className='mb-1 fs-14' htmlFor={name}>{label}</label> : ""}
         
            <Select
                // styles={customStyles}
                name={name}
                value={selectedOption}
                onChange={(option) => onChange({ target: { name, value: option ? option.value : '' } })}
                options={formattedOptions}
                placeholder={placeholder}
                //placeholder=""
                isClearable={selectedOption?.value != ''}
                classNamePrefix="react-select"
                defaultValue={defaultValue}
                className={`react-select-container ${selectedOption ? 'has-value' : ''}`}
                components={{
                    // ClearIndicator: () => null,
                    DropdownIndicator: () => <MdArrowDropDown size={24} className='mx-1' />,
                    IndicatorSeparator: () => null,
                }}
            />
           {error ? (<div className="text-danger">{error}</div>) : null}
        </div>
    );
};

export default ReactSelect;
