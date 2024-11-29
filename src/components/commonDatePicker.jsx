import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdCalendarToday, MdDateRange } from "react-icons/md";
import "./datepicker.scss";

const CommonDatePicker = ({ wrapperClassName = 'mb-3 pb-1', label, selectsRange, size, placeholder, ...rest }) => {

  return (
    <div className={wrapperClassName || ''}>
      {label ? <div className='mb-1 fs-14'>{label}</div> : ""}
      <DatePicker
        isClearable
        showIcon
        toggleCalendarOnIconClick
        placeholderText={placeholder}
        icon={selectsRange ? <MdDateRange size={18} /> : <MdCalendarToday size={18} />}
        className={`form-control ${size === 'sm' ? 'form-control-sm' : ''}`}
        portalId="root"
        {...rest}
      />
    </div>
  );
};

export default CommonDatePicker;
