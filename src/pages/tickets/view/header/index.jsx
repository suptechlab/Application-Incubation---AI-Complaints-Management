import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button, Dropdown, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { MdSchedule } from "react-icons/md";
import { Link } from 'react-router-dom';
import ReactSelect from '../../../../components/ReactSelect';
import { MasterDataContext } from '../../../../contexts/masters.context';
import { agentListingApi, agentTicketToFIagent, agentTicketToSEPSagent } from '../../../../services/ticketmanagement.service';
import { calculateDaysDifference } from '../../../../utils/commonutils';
import AddAttachmentsModal from '../../modals/addAttachmentsModal';
import CloseTicketModal from '../../modals/closeTicketModal';
import DateExtensionModal from '../../modals/dateExtensionModal';
import RejectTicketModal from '../../modals/rejectTicketModal';
import { AuthenticationContext } from '../../../../contexts/authentication.context';

const TicketViewHeader = ({ title = "", ticketData, setIsGetAcitivityLogs, getTicketData }) => {

    const { t } = useTranslation();

    const { masterData } = useContext(MasterDataContext)
    const { currentUser } = useContext(AuthenticationContext);

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

        // setSelectedStatus(status);

        if (status === "CLOSE") {
            setCloseTicketModalShow(true)
        } else if (status === "REJECT") {
            setRejectTicketModalShow(true)
        }
    };

    // The color class based on the status
    // const statusOptions = ['CLOSED', 'IN_PROGRESS', 'NEW', 'REJECTED', 'ASSIGNED'];

    const statusOptions = [{ label: t('CLOSE'), value: 'CLOSE' }, { label: t('REJECT'), value: 'REJECT' }];
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
    // Handle Date Extension Click
    const handleDateExtensionClick = () => {
        setDateExtensionModalShow(true)
    }
    const handleTicketAssign = (agentId) => {
        setLoading(true)
        // agentTicketToSEPSagent
        if (agentId && agentId !== '') {
            if (currentUser === "SEPS_ADMIN" || currentUser === "ADMIN") {
                agentTicketToSEPSagent(agentId, { ticketIds: [ticketData?.id] }).then(response => {
                    toast.success(t("TICKETS ASSIGNED"));
                    setSelectedAgent(null)
                }).catch((error) => {
                    if (error?.response?.data?.errorDescription) {
                        toast.error(error?.response?.data?.errorDescription);
                    } else {
                        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
                    }
                }).finally(() => {
                    setLoading(false)
                })
            } else if (currentUser === "FI_ADMIN") {
                agentTicketToFIagent(agentId, { ticketIds: [ticketData?.id] }).then(response => {
                    toast.success(t("TICKETS ASSIGNED"));
                    setSelectedAgent(null)
                }).catch((error) => {
                    if (error?.response?.data?.errorDescription) {
                        toast.error(error?.response?.data?.errorDescription);
                    } else {
                        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
                    }
                }).finally(() => {
                    setLoading(false)
                })
            }

        } else {
            toast.error("You are not allowed to assign tickets.")
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

const daysDifference = calculateDaysDifference(ticketData?.slaBreachDate);
const isSlaBreachDateValid = ticketData?.slaBreachDate && !isNaN(daysDifference);
    const renderBadge = (bgColor, textColor, message) => (
        <Badge
            bg={bgColor}
            className={`bg-opacity-10 text-${textColor} py-1 px-2 d-inline-flex align-items-center gap-1 rounded-pill`}
        >
            <MdSchedule size={16} />
            <span className="custom-font-size-13 fw-normal">{message}</span>
        </Badge>
    );


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
                        {isSlaBreachDateValid && (
                            daysDifference > 2
                                ? renderBadge("custom-info", "custom-info", `${daysDifference} Days remaining`)
                                : renderBadge("custom-danger", "custom-danger", `${daysDifference} Days remaining`)
                        )}
                        {
                            ticketData?.instanceType === "FIRST_INSTANCE" ?
                                <Badge bg='custom-info' className='fw-semibold px-3 bg-opacity-25 text-custom-info py-1 px-2 d-inline-flex align-items-center gap-1 rounded-pill'>
                                    <span className='custom-font-size-13'>{masterData?.instanceType[ticketData?.instanceType]}</span>
                                </Badge>
                                :
                                <Badge bg='custom-orange' className='fw-semibold px-3 bg-opacity-25 text-custom-orange py-1 px-2 d-inline-flex align-items-center gap-1 rounded-pill'>
                                    <span className='custom-font-size-13'>{masterData?.instanceType[ticketData?.instanceType]}</span>
                                </Badge>
                        }
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
                        {
                            (currentUser === 'FI_ADMIN' && ticketData?.instanceType === 'FIRST_INSTANCE') || 
                            ((currentUser === 'SEPS_ADMIN' || currentUser === 'SUPER_ADMIN') && 
                            ticketData?.instanceType === 'SECOND_INSTANCE')  &&
                            (ticketData?.status !== "CLOSED" && ticketData?.status !== "REJECTED") &&
                            <div className="custom-min-width-120 flex-grow-1 flex-md-grow-0">
                                <ReactSelect
                                    wrapperClassName="mb-0"
                                    class="form-select "
                                    placeholder={t("ASSIGN_REASSIGN")}
                                    id="floatingSelect"
                                    // size="sm"
                                    options={[
                                        {
                                            label: t("ASSIGN_REASSIGN"),
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
                        }
                        {
                            ((currentUser === "FI_ADMIN" || currentUser === "SEPS_ADMIN" || currentUser === "ADMIN") &&
                                (selectedStatus !== "CLOSED" && selectedStatus !== "REJECTED")) ?
                                <Button
                                    type="submit"
                                    variant='warning'
                                    onClick={handleDateExtensionClick}
                                >
                                    {t("DATE_EXTENSION")}
                                </Button> : ""
                        }

                        {
                            selectedStatus !== "CLOSED" && selectedStatus !== "REJECTED" ?
                                <Dropdown>
                                    <Dropdown.Toggle
                                        id="ticket-detail-status"
                                        variant="info"
                                        className={`bg-opacity-25 custom-min-width-130 border-0 ${getStatusClass(selectedStatus)}`}
                                    >
                                        <span className='me-2'>{masterData?.claimTicketStatus[selectedStatus]}</span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {statusOptions?.map((status) => (
                                            <Dropdown.Item
                                                key={status?.value}
                                                className={`small ${selectedStatus === status ? 'active' : ''}`}
                                                onClick={() => handleSelect(status?.value)}
                                            >
                                                {status?.label}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown> :

                                <Button
                                    variant="info"
                                    className={`bg-opacity-25 custom-min-width-130 border-0 ${getStatusClass(selectedStatus)}`}
                                    disabled={true}
                                >
                                    <span className='me-2'>{masterData?.claimTicketStatus[selectedStatus]}</span>
                                </Button>
                        }
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
                getTicketData={getTicketData}
            />
            <CloseTicketModal
                ticketId={ticketData?.id}
                modal={closeTicketModalShow}
                setSelectedStatus={setSelectedStatus}
                toggle={() => setCloseTicketModalShow(false)}
                setIsGetAcitivityLogs={setIsGetAcitivityLogs}
            />
            <RejectTicketModal
                ticketId={ticketData?.id}
                modal={rejectTicketModalShow}
                setSelectedStatus={setSelectedStatus}
                toggle={() => setRejectTicketModalShow(false)}
                setIsGetAcitivityLogs={setIsGetAcitivityLogs}
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