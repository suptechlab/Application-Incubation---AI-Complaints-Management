import React from "react";
import { MdArrowDropDown } from "react-icons/md";
import Select from "react-select";
import "./ReactSelect.scss";

const ReactSelect = ({
  options,
  value,
  onChange,
  wrapperClassName = "mb-3 pb-1",
  size,
  name,
  label,
  placeholder,
  error,
  touched,
  defaultValue = null,
  disabled
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#00549E" : error && touched ? "#FF1418" : "#7F7F7F",
      boxShadow: state.isFocused ? "0 0 0 .2rem rgba(0,123,255,.25)" : null,
      "&:hover": {
        borderColor: state.isFocused
          ? "#00549E"
          : error
          ? "#FF1418"
          : "#7F7F7F",
      },
      minHeight: "42px",
    }),
    menu: (base) => ({
      ...base,
      marginTop: ".25rem",
      marginBottom: ".25rem",
      boxShadow: "0px 2px 2px 0px rgba(0,0,0, 0.15)",
      border: "1px solid #7F7F7F",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#000000",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#000000",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#00549E",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      ":hover": {
        backgroundColor: "#00549E",
        color: "white",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#00549E" : base.backgroundColor,
      color: state.isSelected ? "white" : base.color,
      fontSize: "14px",
      cursor: "pointer",
    }),
  };

  const formattedOptions = options.map((option) => ({
    value: option.value,
    label: option.label,
    isDisabled: option.isDisabled,
  }));
  const selectedOption = formattedOptions.find((opt) => opt.value === value);

  return (
    <div className={wrapperClassName || ""}>
      {label ? ( 
        <label className="mb-1 fs-14" htmlFor={name}>
          {label}
        </label>
      ) : (
        ""
      )}

      <Select
        styles={customStyles}
        name={name}
        value={selectedOption}
        onChange={(option) =>
          onChange({ target: { name, value: option ? option.value : "", label: option ? option.label : "" } })
        }
        options={formattedOptions}
        placeholder={placeholder || 'Select'}
        isClearable={selectedOption?.value != ""}
        classNamePrefix="react-select"
        defaultValue={defaultValue}
        className={`react-select-container ${selectedOption ? "has-value" : ""} ${size === 'sm' ? 'react-select-sm' : ''}`}
        menuPortalTarget={document.body}
        components={{
          ClearIndicator: () => null,
          DropdownIndicator: () => (
            <MdArrowDropDown size={24} className="mx-2" />
          ),
          IndicatorSeparator: () => null,
        }}
        isDisabled={disabled}
        menuPlacement="auto"
        // menuIsOpen={true}
      />
           {touched && error && <small className="form-text text-danger">{error}</small>}
    </div>
  );
};

export default ReactSelect;
