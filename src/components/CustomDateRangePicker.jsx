import React from "react";
import DatePicker,{ registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange, MdOutlineCalendarToday } from "react-icons/md";
import "./datepicker.scss";
import { es } from 'date-fns/locale/es';
registerLocale('es', es)

const CustomDateRangePicker = ({ wrapperClassName = 'mb-3 pb-1', label, handleChange, startDate, endDate, tempDateRange, selectsRange, placeholder, size, disabled,maxDate }) => {

  return (
    <div className={wrapperClassName || ''}>
      {label ? <div className='mb-1 fs-14'>{label}</div> : ""}
      <DatePicker
       locale="es"
        placeholderText={placeholder}
        selected={startDate}
        onChange={handleChange}
        showMonthYearPicker
        selectsRange={selectsRange}
        startDate={tempDateRange[0]}
        endDate={tempDateRange[1]}
        dateFormat="YYYY-MM"
        showDatePicker
        isClearable
        showIcon
        toggleCalendarOnIconClick
        icon={selectsRange ? <MdDateRange size={18} /> : <MdOutlineCalendarToday size={18} />}
        className={`form-control ${size === 'sm' ? 'form-control-sm' : ''}`}
        disabled={disabled}
        portalId="root"
        maxDate={maxDate}
      />
    </div>
  );
};

export default CustomDateRangePicker;
