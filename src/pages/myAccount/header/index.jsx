import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Stack } from 'react-bootstrap';
import CustomDateRangePicker from '../../../components/CustomDateRangePicker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const PageHeader = ({ title = "", filter, setFilter }) => {

    const {t} = useTranslation()
    const [startDate, setStartDate] = useState()
    const handleDateChange = (date) => {
        setStartDate(date)
        setFilter({ year: moment(date).format('yyyy') })
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

                {/* <Stack direction="horizontal" gap={2} className='gap-md-3 flex-wrap'>
                    <div className="custom-width-140 flex-grow-1 flex-md-grow-0">
                        <CustomDateRangePicker
                            wrapperClassName="mb-0"
                            placeholder={t("SELECT")}
                            selected={startDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy"
                            showYearPicker

                        />
                    </div>
                </Stack> */}
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