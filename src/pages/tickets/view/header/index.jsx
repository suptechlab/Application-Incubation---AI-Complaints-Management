import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Badge, Button, Dropdown, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { MdSchedule } from "react-icons/md";
import { Link } from 'react-router-dom';
import ReactSelect from '../../../../components/ReactSelect';
import { agentListingApi, agentTicketToFIagent, agentTicketToSEPSagent } from '../../../../services/ticketmanagement.service';
import AddAttachmentsModal from '../../modals/addAttachmentsModal';
import CloseTicketModal from '../../modals/closeTicketModal';
import DateExtensionModal from '../../modals/dateExtensionModal';
import RejectTicketModal from '../../modals/rejectTicketModal';

const TicketViewHeader = ({ title = "", ticketData }) => {
    const { t } = useTranslation();
    const [agentList, setAgentListing] = useState([])
    const [selectedStatus, setSelectedStatus] = useState(ticketData?.status);
    const [addAttachmentsModalShow, setAddAttachmentsModalShow] = useState(false);
    const [dateExtensionModalShow, setDateExtensionModalShow] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null)
    const [closeTicketModalShow, setCloseTicketModalShow] = useState(false)
    const [rejectTicketModalShow, setRejectTicketModalShow] = useState(false)

    const [loading, setLoading] = useState(false)
    // Function to handle dropdown item selection
    const handleSelect = (status) => {
        setSelectedStatus(status);

        if (status === "CLOSED") {
            setCloseTicketModalShow(true)
        }else if (status === "REJECTED"){
            setRejectTicketModalShow(true)
        }
    };

    // The color class based on the status
    const statusOptions = ['CLOSED', 'IN_PROGRESS', 'NEW', 'REJECTED', 'ASSIGNED'];
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

    useEffect(() => {
        setSelectedStatus(ticketData?.status)
    }, [ticketData?.status])

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

    // Handle Date Extension Click
    const handleDateExtensionClick = () => {
        setDateExtensionModalShow(true)
    }

    const handleTicketAssign = (agentId) => {
        setLoading(true)
        // agentTicketToSEPSagent
        if (agentId && agentId !== '') {
            agentTicketToSEPSagent(agentId).then(response => {
                toast.success(t("TICKETS ASSIGNED"));

            }).catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
                }
            }).finally(() => {
                setLoading(false)
            })

            // agentTicketToFIagent(agentId).then(response => {
            //     toast.success(t("TICKETS ASSIGNED"));

            // }).catch((error) => {
            //     if (error?.response?.data?.errorDescription) {
            //         toast.error(error?.response?.data?.errorDescription);
            //     } else {
            //         toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
            //     }
            // }).finally(() => {
            //     setLoading(false)
            // })
        }
    }

    // GET AGENT DROPDOWN LISTING
    const getAgentDropdownListing = () => {
        agentListingApi().then(response => {
            if (response?.data && response?.data?.length > 0) {
                const dropdownData = response?.data.map(item => ({
                    value: item.id,
                    label: item.name
                }));
                setAgentListing(dropdownData)
            }
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
            }
        })
    }
    useEffect(() => {
        getAgentDropdownListing()
    }, [])
    return (
        <React.Fragment>
            <div className="pb-3">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="flex-wrap custom-min-height-38"
                >
                    <h1 className="fw-semibold fs-4 mb-0 me-auto d-inline-flex align-items-center gap-2">
                        {title}
                        {ticketData?.slaBreachDate && <Badge bg='custom-danger' className='bg-opacity-10 text-custom-danger py-1 px-2 d-inline-flex align-items-center gap-1 rounded-pill'>
                            <MdSchedule size={16} />
                            <span className='custom-font-size-13 fw-normal'>{timeRemaining(ticketData?.slaBreachDate)}</span>
                        </Badge>}

                        <Badge bg='custom-orange' className='fw-semibold px-3 bg-opacity-25 text-custom-orange py-1 px-2 d-inline-flex align-items-center gap-1 rounded-pill'>
                            <span className='custom-font-size-13'>Second Instance</span>
                        </Badge>
                    </h1>

                    <Stack direction="horizontal" gap={2} className='flex-wrap'>
                        <Link
                            to={"/tickets"}
                            className="btn btn-outline-dark custom-min-width-85"
                        >
                            {t("BACK")}
                        </Link>
                        {/* <Button
                            type="submit"
                            variant='outline-dark'
                        >
                            Assign To
                        </Button> */}
                        <div className="custom-min-width-120 flex-grow-1 flex-md-grow-0">
                            <ReactSelect
                                wrapperClassName="mb-0"
                                class="form-select "
                                placeholder="Assign/Reassign"
                                id="floatingSelect"
                                size="sm"
                                options={[
                                    {
                                        label: "Assign/Reassign",
                                        value: "",
                                    },
                                    ...agentList
                                ]}
                                onChange={(e) => {
                                    handleTicketAssign(e.target.value)
                                    setSelectedAgent(e.target.value)
                                }}
                                value={selectedAgent ?? null}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant='warning'
                            onClick={handleDateExtensionClick}
                        >
                            Date Extension
                        </Button>
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
                        {/* <Dropdown>
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
                        </Dropdown> */}
                    </Stack>
                </Stack>
            </div>

            {/* Attachments Modals */}
            <AddAttachmentsModal
                modal={addAttachmentsModalShow}
                toggle={() => setAddAttachmentsModalShow(false)}
            />

            {/* Date Extension Modals */}
            <DateExtensionModal
                ticketData={ticketData}
                modal={dateExtensionModalShow}
                toggle={() => setDateExtensionModalShow(false)}
            />
            <CloseTicketModal
                ticketId={ticketData?.id}
                modal={closeTicketModalShow}
                toggle={() => setCloseTicketModalShow(false)}
            />
            <RejectTicketModal
                ticketId={ticketData?.id}
                modal={rejectTicketModalShow}
                toggle={() => setRejectTicketModalShow(false)}
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