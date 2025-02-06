import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button, Dropdown, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { MdSchedule } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import ReactSelect from '../../../../components/ReactSelect';
import { AuthenticationContext } from '../../../../contexts/authentication.context';
import { MasterDataContext } from '../../../../contexts/masters.context';
import { agentListingApi, agentTicketToFIagent, agentTicketToSEPSagent, downloadTicketDetails, ticketStatusChange } from '../../../../services/ticketmanagement.service';
import { calculateDaysDifference } from '../../../../utils/commonutils';
import AddAttachmentsModal from '../../modals/addAttachmentsModal';
import CloseTicketModal from '../../modals/closeTicketModal';
import DateExtensionModal from '../../modals/dateExtensionModal';
import RejectTicketModal from '../../modals/rejectTicketModal';
import { IoMdDownload } from "react-icons/io";

const TicketViewHeader = ({ title = "", ticketData, setIsGetActivityLogs, getTicketData, permissionState, setLoading }) => {

    const { t } = useTranslation();

    const { masterData } = useContext(MasterDataContext)
    const { currentUser } = useContext(AuthenticationContext);

    const navigate = useNavigate()

    const [agentList, setAgentListing] = useState([])
    const [selectedStatus, setSelectedStatus] = useState(ticketData?.status);
    const [addAttachmentsModalShow, setAddAttachmentsModalShow] = useState(false);
    const [dateExtensionModalShow, setDateExtensionModalShow] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null)
    const [closeTicketModalShow, setCloseTicketModalShow] = useState(false)
    const [rejectTicketModalShow, setRejectTicketModalShow] = useState(false)
    const [isDownloading,setDownloading] = useState(false)

    // const [loading, setLoading] = useState(false)
    // Function to handle dropdown item selection
    const handleSelect = (status) => {
        const actions = {
            CLOSE: () => setCloseTicketModalShow(true),
            REJECT: () => setRejectTicketModalShow(true),
            IN_PROGRESS: () => handleTicketStatusChange('IN_PROGRESS'),
            PENDING: () => handleTicketStatusChange('PENDING')
        };

        actions[status]?.();
    };

    // The color class based on the status
    // const statusOptions = ['CLOSED', 'IN_PROGRESS', 'NEW', 'REJECTED', 'ASSIGNED'];

    const statusOptions = [
        ...((permissionState?.closePermission === true && 
            ((ticketData?.instanceType==='FIRST_INSTANCE' && ticketData?.fiAgentId !==null)||
            ((ticketData?.instanceType==='SECOND_INSTANCE' ||ticketData?.instanceType==='COMPLAINT' ) && ticketData?.sepsAgentId !==null)))
            ? [{ label: t('CLOSE'), value: 'CLOSE' }] : []),
        ...(permissionState?.rejectPermission === true ? [{ label: t('REJECT'), value: 'REJECT' }] : []),
        { label: t('IN_PROGRESS'), value: 'IN_PROGRESS' },
        { label: t('PENDING'), value: 'PENDING' }];
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


    //Handle Ticket Status Change
    const handleTicketStatusChange = async (status) => {
        // setLoading(true);
        try {
            const response = await ticketStatusChange(ticketData?.id, status);
            toast.success(response.data.message);
            setIsGetActivityLogs((prev) => !prev)
            setSelectedStatus(status)
            // await getTicketData();
        } catch (error) {
            const errorMessage = error?.response?.data?.errorDescription || "An unexpected error occurred.";
            toast.error(errorMessage);
        } finally {
            // setLoading(false);
        }
    };

    // Custom function to display "remaining" for future dates
    // Handle Date Extension Click
    const handleDateExtensionClick = () => {
        setDateExtensionModalShow(true)
    }
    const handleTicketAssign = (agentId) => {
        setLoading(true)
        // agentTicketToSEPSagent
        if (agentId && agentId !== '') {
            if (currentUser === "SEPS_USER" || currentUser === "SYSTEM_ADMIN") {
                agentTicketToSEPSagent(agentId, { ticketIds: [ticketData?.id] }).then(response => {
                    toast.success(t("TICKETS ASSIGNED"));
                    setSelectedAgent(null)
                    getTicketData()
                }).catch((error) => {
                    if (error?.response?.data?.errorDescription) {
                        toast.error(error?.response?.data?.errorDescription);
                    } else {
                        toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
                    }
                }).finally(() => {
                    setLoading(false)
                })
            } else if (currentUser === "FI_USER") {
                agentTicketToFIagent(agentId, { ticketIds: [ticketData?.id] }).then(response => {
                    toast.success(t("TICKETS ASSIGNED"));
                    setSelectedAgent(null)
                    getTicketData()
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
            toast.error(t('YOU_ARE_NOT_ALLOWED_TO_ASSIGN_TICKETS'))
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
    // DOWNLOAD CLAIM TYPES LIST
     const handleTicketDetailsDownload = () => {
        setDownloading(true)
        toast.loading(t("DOWNLOAD_IN_PROGRESS"), { id: "downloading", isLoading: isDownloading })
        downloadTicketDetails(ticketData?.id).then(response => {
          if (response?.data) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);

            toast.success(t("DOWNLOAD_SUCCESSFUL"), { id: "downloading" })


            const tempLink = document.createElement('a');
            tempLink.href = blobUrl;
            tempLink.setAttribute('download', 'ticket_details.pdf');

            // Append the link to the document body before clicking it
            document.body.appendChild(tempLink);

            tempLink.click();

            // Clean up by revoking the Blob URL
            window.URL.revokeObjectURL(blobUrl);

            // Remove the link from the document body after clicking
            document.body.removeChild(tempLink);
          } else {
            throw new Error(t("EMPTY RESPONSE"));
          }
        }).catch((error) => {
          if (error?.response?.data?.errorDescription) {
            toast.error(error?.response?.data?.errorDescription);
          } else {
            toast.error(error?.message ?? t("STATUS UPDATE ERROR"));
          }
          toast.dismiss("downloading");
        }).finally(() => {
          // Ensure the loading toast is dismissed
          // toast.dismiss("downloading");
          setDownloading(false)
        });
      }

    return (
        <React.Fragment>
            {/* <Loader isLoading={loading} /> */}
            <div className="pb-3">
                <Stack
                    direction="horizontal"
                    gap={2}
                    className="flex-wrap custom-min-height-38"
                >
                    <h1 className="fw-semibold fs-4 mb-0 me-auto d-inline-flex align-items-center gap-2">

                        {title ?? ""}
                        {isSlaBreachDateValid && (
                            daysDifference > 2
                                ? renderBadge("custom-info", "custom-info", `${daysDifference} ${t("DAYS_REMAINING")}`)
                                : renderBadge("custom-danger", "custom-danger", `${daysDifference} ${t("DAYS_REMAINING")}`)
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
                        <button
                            onClick={()=>navigate(-1)}
                            // to={"/tickets"}
                            className="btn btn-outline-dark custom-min-width-85"
                        >
                            {t("BACK")}
                        </button>
                        <Button
                            type="button"
                            variant='outline-primary'
                            onClick={handleTicketDetailsDownload}
                            className="btn btn-outline-dark"
                        >
                           <IoMdDownload size={18}/> {t("DOWNLOAD_TICKET_DETAILS")}
                        </Button>
                        {
                            permissionState?.assignPermission === true &&
                            (
                            (currentUser === 'FI_USER' && ticketData?.instanceType === 'FIRST_INSTANCE') ||
                            ((currentUser === 'SEPS_USER' || currentUser === 'SYSTEM_ADMIN') &&
                            (( ticketData?.instanceType === 'SECOND_INSTANCE' || ticketData?.instanceType === 'COMPLAINT' ))) &&
                                (ticketData?.status !== "CLOSED" && ticketData?.status !== "REJECTED")) &&
                            <div className="custom-min-width-120 flex-grow-1 flex-md-grow-0">
                                <ReactSelect
                                    wrapperClassName="mb-0"
                                    className="form-select"
                                    placeholder={t("ASSIGN_REASSIGN")}
                                    id="floatingSelect"
                                    size="md"
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
                            (permissionState?.dateExtPermission === true && (selectedStatus !== "CLOSED" && selectedStatus !== "REJECTED" && ticketData?.slaBreachDate !== null)) ?
                                <Button
                                    type="submit"
                                    variant='warning'
                                    onClick={handleDateExtensionClick}
                                >
                                    {t("DATE_EXTENSION")}
                                </Button> : ""
                        }
                       
                        {
                            (permissionState?.statusModule === true && (selectedStatus !== "CLOSED" && selectedStatus !== "REJECTED")) ?
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
                setIsGetActivityLogs={setIsGetActivityLogs}
                getTicketData={getTicketData}
            />
            <RejectTicketModal
                ticketId={ticketData?.id}
                modal={rejectTicketModalShow}
                setSelectedStatus={setSelectedStatus}
                toggle={() => setRejectTicketModalShow(false)}
                setIsGetActivityLogs={setIsGetActivityLogs}
                getTicketData={getTicketData}
            />
        </React.Fragment>
    );
};

TicketViewHeader.propTypes = {
    title: PropTypes.string.isRequired,
    ticketData: PropTypes.object, // Assuming ticketData is an object, adjust based on the actual structure
    setIsGetActivityLogs: PropTypes.func.isRequired,
    getTicketData: PropTypes.func.isRequired,
    permissionState: PropTypes.object, // Adjust based on the actual structure of permissionState
    setLoading: PropTypes.func.isRequired,
    // actions: PropTypes.arrayOf(PropTypes.shape({
    //     label: PropTypes.string.isRequired,
    //     onClick: PropTypes.func,
    //     to: PropTypes.string, // If present, renders a Link
    //     variant: PropTypes.string, // Only for Button
    //     disabled: PropTypes.bool, // Only for Button
    // })),
};

TicketViewHeader.defaultProps = {
    // actions: [],
    ticketData: null, // Set default value for ticketData if needed
    permissionState: null, // Set default value for permissionState if needed
    // setIsGetActivityLogs:null,
};

export default TicketViewHeader;