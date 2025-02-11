import React from "react";
import { MdArrowDropDown } from "react-icons/md";
import Select from "react-select";
import "./ReactSelect.scss";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
const ReactSelect = ({
  options = [],
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
  disabled,
}) => {


  const { t } = useTranslation()
  const customStyles = {


    control: (base, state) => {
      const errorColor = error && touched ? "#FF1418" : "#7F7F7F";
      const borderColor = state.isFocused ? "#00549E" : errorColor;
      return {
        ...base,
        borderColor,
        boxShadow: state.isFocused ? "0 0 0 .2rem rgba(0,123,255,.25)" : null,
        "&:hover": { borderColor },
        minHeight: "42px",
      };
    },

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

  let sizeClass = "";
  if (size === "sm") {
    sizeClass = "react-select-sm";
  } else if (size === "md") {
    sizeClass = "react-select-md";
  }

  const containerClass = `react-select-container ${selectedOption ? "has-value" : ""} ${sizeClass}`;

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
        placeholder={placeholder || t('SELECT')}
        isClearable={selectedOption?.value !== ""}
        classNamePrefix="react-select"
        defaultValue={defaultValue}
        className={containerClass}
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


ReactSelect.propTypes = {
  options: PropTypes.array, // options can be an array, and it’s optional
  value: PropTypes.any, // value can be any type (you can change it to a more specific type if needed)
  onChange: PropTypes.func, // onChange should be a function
  wrapperClassName: PropTypes.string, // wrapperClassName is a string
  size: PropTypes.string, // size can be a string (you can define more specific sizes if needed)
  name: PropTypes.string, // name should be a string
  label: PropTypes.string, // label should be a string
  placeholder: PropTypes.string, // placeholder should be a string
  error: PropTypes.string, // error should be a string
  touched: PropTypes.bool, // touched should be a boolean
  defaultValue: PropTypes.any, // defaultValue can be any type (null is a common default)
  disabled: PropTypes.bool, // disabled should be a boolean
};

ReactSelect.defaultProps = {
  options: [], // Default to an empty array
  wrapperClassName: "mb-3 pb-1", // Default wrapper class
  defaultValue: null, // Default value is null
};

export default ReactSelect;
