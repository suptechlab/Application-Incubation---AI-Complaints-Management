import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Badge, Dropdown, Stack } from 'react-bootstrap';
import { MdMoreVert, MdSchedule } from "react-icons/md";
import { Link } from 'react-router-dom';
import AppTooltip from '../../../../components/tooltip';
import AddAttachmentsModal from '../../modals/addAttachmentsModal';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const TicketViewHeader = ({ title = "", ticketData }) => {
    const { t } = useTranslation();
    const [selectedStatus, setSelectedStatus] = useState(ticketData?.status);
    const [addAttachmentsModalShow, setAddAttachmentsModalShow] = useState(false);

    // Function to handle dropdown item selection
    const handleSelect = (priority) => {
        setSelectedStatus(priority);
    };

    // The color class based on the status
    const statusOptions = ['CLOSED', 'IN_PROGRESS', 'NEW', 'REJECTED','ASSIGNED'];
    const getStatusClass = (status) => {
        switch (status) {
            case 'CLOSED':
                return 'bg-success';
            case 'IN_PROGRESS':
                return 'bg-info';
            case 'NEW':
                return 'bg-primary';
            case 'REJECTED':
                return 'bg-danger';
            case 'ASSIGNED':
                return 'bg-warning';
            default:
                return 'bg-body';
        }
    };

    useEffect(()=>{
        setSelectedStatus(ticketData?.status)
    },[ticketData?.status])

    // Handle Add Attachments Click
    const handleAddAttachmentsClick = () => {
        setAddAttachmentsModalShow(true)
    }
    // Custom function to display "remaining" for future dates
    const timeRemaining = (date) => {
        const now = moment();
        const targetDate = moment(date);

        if (targetDate.isAfter(now)) {
            return `${targetDate.toNow(true)} remaining`; // 'true' omits 'in'/'ago'
        } else {
            return `${targetDate.fromNow()}`; // Uses default format for past dates
        }
    };

    return (
        <React.Fragment>
            <div className="pb-3">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="flex-wrap custom-min-height-38"
                >
                    <h1 className="fw-semibold fs-4 mb-0 me-auto d-inline-flex align-items-center gap-1">
                        {title}
                        {ticketData?.slaBreachDate ? <Badge bg='danger-subtle' className='text-danger py-1 px-2 d-inline-flex align-items-center gap-1 rounded-pill'>
                            <MdSchedule size={16} />
                            <span className='custom-font-size-13 fw-normal'>{timeRemaining(ticketData?.slaBreachDate)}</span>
                        </Badge> : ""}
                    </h1>

                    <Stack direction="horizontal" gap={2} className='gap-md-3 flex-wrap'>
                        <Link
                            to={"/tickets"}
                            className="btn btn-outline-dark custom-min-width-85"
                        >
                            {t("BACK")}
                        </Link>
                        <Dropdown>

                            <Dropdown.Toggle
                                id="ticket-detail-status"
                                variant="info"
                                className={`bg-opacity-25 custom-min-width-130 border-0 ${getStatusClass(selectedStatus)}`}
                            >
                                <span className='me-2'>{selectedStatus}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {statusOptions?.map((status) => (
                                    <Dropdown.Item
                                        key={status}
                                        className={`small ${selectedStatus === status ? 'active' : ''}`}
                                        onClick={() => handleSelect(status)}
                                    >
                                        {status}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="link"
                                id="ticket-detail-filter"
                                className="link-dark p-1 ms-n2 hide-dropdown-arrow"
                            >
                                <AppTooltip title="Filters" placement="top">
                                    <span><MdMoreVert size={24} /></span>
                                </AppTooltip>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-lg rounded-3 border-0 mt-1">
                                <Dropdown.Item className="small" onClick={handleAddAttachmentsClick}>
                                    Claim Filled By
                                </Dropdown.Item>
                                <Dropdown.Item className="small" as={Link} to="">
                                    SLA
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Stack>
                </Stack>
            </div>

            {/* Attachments Modals */}
            <AddAttachmentsModal
                modal={addAttachmentsModalShow}
                toggle={() => setAddAttachmentsModalShow(false)}
            />
        </React.Fragment>
    );
};

TicketViewHeader.propTypes = {
    title: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        to: PropTypes.string, // If present, renders a Link
        variant: PropTypes.string, // Only for Button
        disabled: PropTypes.boolean, // Only for Button
    })),
};

TicketViewHeader.defaultProps = {
    actions: [],
};

export default TicketViewHeader;