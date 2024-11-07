import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomDateRangePicker = ({ handleChange, startDate, endDate, tempDateRange }) => {

  return (
    <DatePicker
      placeholderText="Select date range" // Placeholder for the date range
      selected={startDate}
      onChange={handleChange}
      selectsRange
      startDate={tempDateRange[0]}
      endDate={tempDateRange[1]}
      dateFormat="YYYY-MM-dd"
      showDatePicker
      isClearable
    />
  );
};

export default CustomDateRangePicker;
