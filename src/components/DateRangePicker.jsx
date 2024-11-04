import moment from 'moment';
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import SvgIcons from './SVGIcons';

export default function DateRangePicker({
    startDate,
    endDate,
    onChange

}) {
    const ref = React.useRef()
    return (
        <div className='form-floating mb-3 position-relative form-control__calendar'>
            <input
                className='form-control'
                placeholder='Date Range'
                value={startDate && endDate ? `${moment(startDate).format("DD/MM/YYYY")} - ${moment(endDate).format("DD/MM/YYYY")}` : ''}
                onClick={() => {
                    ref.current.setOpen(true)
                }}
            />
            <DatePicker
                ref={ref}
                className='form-control d-none w-100'
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                wrapperClassName='d-none'
            // inline
            />
            <span className=''>
                {SvgIcons.calendarIcon}
            </span>
            <label>Date Range</label>
        </div>

    )
}
