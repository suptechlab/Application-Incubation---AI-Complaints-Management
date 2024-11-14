import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Badge, Dropdown, Stack } from 'react-bootstrap';
import { MdMoreVert, MdSchedule } from "react-icons/md";
import { Link } from 'react-router-dom';
import AppTooltip from '../../../../components/tooltip';

const TicketViewHeader = ({ title = "" }) => {
    const [selectedStatus, setSelectedStatus] = useState('In Progress');

  // Function to handle dropdown item selection
  const handleSelect = (priority) => {
    setSelectedStatus(priority);
  };

    // The color class based on the status
    const getStatusClass = (status) => {
        switch (status) {
            case 'Closed':
                return 'bg-success';
            case 'In progress':
                return 'bg-info';
            case 'New':
                return 'bg-primary';
            case 'Rejected':
                return 'bg-danger';
            default:
                return 'bg-body';
        }
    };

    return (
        <div className="contentHeader">
            <Stack
                direction="horizontal"
                gap={2}
                className="flex-wrap custom-min-height-38"
            >
                <h1 className="fw-semibold fs-4 mb-0 me-auto d-inline-flex align-items-center gap-1">
                    {title}
                    <Badge bg='danger-subtle' className='text-danger py-1 px-2 d-inline-flex align-items-center gap-1 rounded-pill'>
                        <MdSchedule size={16} />
                        <span className='custom-font-size-13 fw-normal'>10 Days Remaning</span>
                    </Badge>
                </h1>

                <Stack direction="horizontal" gap={2} className='gap-md-3 flex-wrap'>
                    <Dropdown>
                        <Dropdown.Toggle
                            id="ticket-detail-status"
                            variant="info"
                            className={`bg-opacity-25 custom-min-width-130 border-0 ${getStatusClass(selectedStatus)}`}
                        >
                            <span className='me-2'>{selectedStatus}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item className="small" onClick={() => handleSelect('Closed')}>Closed</Dropdown.Item>
                            <Dropdown.Item className="small" onClick={() => handleSelect('In progress')}>In progress</Dropdown.Item>
                            <Dropdown.Item className="small" onClick={() => handleSelect('New')}>New</Dropdown.Item>
                            <Dropdown.Item className="small" onClick={() => handleSelect('Rejected')}>Rejected</Dropdown.Item>
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
                            <Dropdown.Item className="small" as={Link} to="">
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