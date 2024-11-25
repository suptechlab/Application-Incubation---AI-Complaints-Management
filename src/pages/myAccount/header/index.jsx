import React, { useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import CustomDateRangePicker from '../../../components/CustomDateRangePicker';
import moment from 'moment';

const PageHeader = ({ title = "", filter, setFilter }) => {
    const { t } = useTranslation();
    // Temporary state to hold the selected dates
    const [tempDateRange, setTempDateRange] = useState([null, null]);

    const handleDateFilterChange = ([newStartDate, newEndDate]) => {
        setTempDateRange([newStartDate, newEndDate]);

        // Update filter state only if both dates are selected
        if (newStartDate && newEndDate) {
            setFilter({
                startDate: moment(newStartDate).format("YYYY-MM-DD"),
                endDate: moment(newEndDate).format("YYYY-MM-DD")
            });
        }
    };

    return (
        <div className="contentHeader pb-3">
            <Stack
                direction="horizontal"
                gap={2}
                className="flex-wrap custom-min-height-38"
            >
                <h1 className="fw-bold fs-4 mb-0 me-auto">
                    {title}
                </h1>

                <Stack direction="horizontal" gap={2} className='gap-md-3 flex-wrap'>
                    <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                        <CustomDateRangePicker
                            wrapperClassName="mb-0"
                            tempDateRange={tempDateRange}
                            handleChange={handleDateFilterChange}
                            startDate={filter?.startDate ?? null}
                            endDate={filter?.endDate}
                            selectsRange={true}
                            placeholder="Select Date Range"
                        />
                    </div>
                </Stack>
            </Stack>
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        to: PropTypes.string, // If present, renders a Link
        variant: PropTypes.string, // Only for Button
        disabled: PropTypes.boolean, // Only for Button
    })),
};

PageHeader.defaultProps = {
    actions: [],
};

export default PageHeader;