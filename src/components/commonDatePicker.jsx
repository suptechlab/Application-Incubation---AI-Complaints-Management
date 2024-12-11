import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange, MdOutlineCalendarToday } from "react-icons/md";
import "./datepicker.scss";

const CommonDatePicker = ({ wrapperClassName = 'mb-3 pb-1', label, selectsRange, size, placeholder,isBackDateBlocked = false, error,touched, ...rest }) => {
  const today = new Date();
  return (
    <div className={wrapperClassName || ''}>
      {label ? <div className='mb-1 fs-14'>{label}</div> : ""}
      <DatePicker
        isClearable
        showIcon
        toggleCalendarOnIconClick
        placeholderText={placeholder}
        icon={selectsRange ? <MdDateRange size={18} /> : <MdOutlineCalendarToday size={18} />}
        className={`form-control ${size === 'sm' ? 'form-control-sm' : ''}`}
        portalId="root"
        minDate={isBackDateBlocked ? today : undefined} // Block backdates if prop is true
        {...rest}
      />
       {touched && error && <small className="form-text text-danger">{error}</small>}
    </div>
  );
};

export default CommonDatePicker;
