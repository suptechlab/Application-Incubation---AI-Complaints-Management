import { es } from 'date-fns/locale/es';
import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange, MdOutlineCalendarToday } from "react-icons/md";
import "./datepicker.scss";
registerLocale('es', es)

const CustomDateRangePicker = ({ wrapperClassName = 'mb-3 pb-1', label, handleChange, startDate, endDate, tempDateRange, selectsRange, placeholder, size, disabled, maxDate }) => {


  const onDateChange = (dates) => {
    handleChange(dates);
  };

  return (
    <div className={wrapperClassName || ''}>
      {label ? <div className='mb-1 fs-14'>{label}</div> : ""}
      <DatePicker
        locale="es"
        placeholderText={placeholder}
        selected={startDate}
        onChange={onDateChange}
        showFullMonthYearPicker
        // showMonthYearPicker
        selectsRange={selectsRange}
        startDate={tempDateRange[0]}
        endDate={endDate}
        dateFormat="YYYY-MM-dd"
        showDatePicker
        isClearable
        showIcon
        toggleCalendarOnIconClick
        icon={selectsRange ? <MdDateRange size={18} /> : <MdOutlineCalendarToday size={18} />}
        className={`form-control ${size === 'sm' ? 'form-control-sm' : ''}`}
        disabled={disabled}
        portalId="root"
        showMonthDropdown // Enables month dropdown
        showYearDropdown // Enables year dropdown
        scrollableYearDropdown // Allows scrolling in the year dropdown
        yearDropdownItemNumber={50} // Show 50 years in the dropdown
        // readOnly // Prevents manual typing
        onKeyDown={(e) => e.preventDefault()} // Blocks keypress events
        // maxDate={maxDate}
        maxDate={new Date()}// FUTURE DATE CAN NOT BE SELECT
      />
    </div>
  );
};

export default CustomDateRangePicker;
