import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CustomDateRangePicker from "../../../../components/CustomDateRangePicker";
import FormInput from "../../../../components/FormInput";
import ReactSelect from "../../../../components/ReactSelect";
import { AuthenticationContext } from "../../../../contexts/authentication.context";
import { MasterDataContext } from "../../../../contexts/masters.context";
import { claimTypesDropdownList } from "../../../../services/claimSubType.service";
import { agentListingApi, convertToLabelValue } from "../../../../services/ticketmanagement.service";
import { LuFilterX } from "react-icons/lu";

const TicketsListFilters = ({ filter, setFilter, handleTicketAssign, ticketArr, clearTableSelection, permissionsState ,isTaggedList}) => {

    const { currentUser } = useContext(AuthenticationContext);

    const { masterData } = useContext(MasterDataContext)

    const { t } = useTranslation();
    const [claimTypes, setClaimTypes] = useState([])
    const [agentList, setAgentList] = useState([])
    const [selectedAgent, setSelectedAgent] = useState(null)

    const [statusDropdownData, setStatusDropdownData] = useState([])
    const [priorityDropdwonData, setPriorityDropdownData] = useState([])
    const [instanceTypeDropdown, setInstanceTypeDropdown] = useState([])
    // Temporary state to hold the selected dates
    const [tempDateRange, setTempDateRange] = useState([null, null]);

    const handleDateFilterChange = ([newStartDate, newEndDate]) => {
        setTempDateRange([newStartDate, newEndDate]);


        // Update filter state only if both dates are selected
        if ((newStartDate && newEndDate )) {
            setFilter({
                startDate: moment(newStartDate).format("YYYY-MM-DD"),
                endDate: moment(newEndDate).format("YYYY-MM-DD")
            });
        } else if(filter?.startDate && filter?.endDate){
            setFilter((prevFilters) => {
                const { startDate, endDate, ...restFilters } = prevFilters;
                return { ...restFilters };
            });
        }
    };
    // GET CLAIM TYPE DROPDOWN LIST
    const getClaimTypeDropdownList = () => {
        claimTypesDropdownList().then(response => {
            if (response?.data && response?.data?.length > 0) {
                const dropdownData = response?.data.map(item => ({
                    value: item.id,
                    label: item.name
                }));
                setClaimTypes(dropdownData)
            }
        }).catch((error) => {
            if (error?.response?.data?.errorDescription) {
                toast.error(error?.response?.data?.errorDescription);
            } else {
                toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
            }
        })
    }
    // GET AGENT DROPDOWN LISTING
    const getAgentDropdownListing = () => {
        agentListingApi().then(response => {
            if (response?.data && response?.data?.length > 0) {
                const dropdownData = response?.data.map(item => ({
                    value: item.id,
                    label: item.name
                }));
                setAgentList(dropdownData)
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
        getClaimTypeDropdownList()
        getAgentDropdownListing()

    }, [])
    useEffect(() => {

        if (clearTableSelection === true) {
            setSelectedAgent('')
        }
    }, [clearTableSelection])


    useEffect(() => {
        if (masterData?.claimTicketStatus) {
            setStatusDropdownData([{ value: '', label: t('ALL STATUS') }, ...convertToLabelValue(masterData?.claimTicketStatus)])
            setPriorityDropdownData([{ value: '', label: t('ALL_PRIORITY') }, ...convertToLabelValue(masterData?.claimTicketPriority)])
            setInstanceTypeDropdown([{ value: '', label: t('ALL_INSTANCE') }, ...convertToLabelValue(masterData?.instanceType)])
        }


    }, [masterData])


    return (
        <div className="theme-card-header header-search mb-3">
            <Stack direction="horizontal" gap={2} className="flex-wrap gap-md-3">
                <div className="custom-width-200 flex-grow-1 flex-sm-grow-0 me-auto">
                    <FormInput
                        wrapperClassName="mb-0"
                        id="search"
                        key={"search"}
                        name="search"
                        placeholder={t("SEARCH")}
                        type="text"
                        size="sm"
                        onChange={(event) => {
                            if (event.target.value === "") {
                                setFilter({
                                    ...filter,
                                    search: undefined,
                                });
                                return;
                            }
                            setFilter({
                                ...filter,
                                search: event.target.value,
                            });
                        }}
                        value={filter?.search}
                    />
                </div>

                <Button size="sm" type="button" variant="warning" onClick={() => {
                    setFilter({
                        search: "",
                        status: "",
                        claimTypeId: "",
                        instanceType: "",
                        claimTicketPriority: "",
                        claimTicketStatus: "",
                        startDate: null,
                        endDate: null
                    })
                    setTempDateRange([null,null])
                }}>
                    <LuFilterX size={18} />  {t("RESET")}
                </Button>
                {
                    !isTaggedList && permissionsState?.assignPermission === true ?
                        <div className="custom-min-width-120 flex-grow-1 flex-md-grow-0">
                            <ReactSelect
                                wrapperClassName="mb-0"
                                class="form-select "
                                placeholder={t("ASSIGN_REASSIGN")}
                                id="floatingSelect"
                                size="sm"
                                options={[
                                    {
                                        label: t("ASSIGN_REASSIGN"),
                                        value: "",
                                    },
                                    ...agentList
                                ]}
                                disabled={ticketArr?.length > 0 ? false : true}
                                onChange={(e) => {
                                    handleTicketAssign(e.target.value)
                                    setSelectedAgent(e.target.value)
                                }}
                                value={selectedAgent ?? null}
                            />
                        </div> : ''
                }

                {/* currentUser === 'FI_AGENT' || currentUser === 'SEPS_AGENT' ? <Button
                            type="button"
                            variant="warning"
                            onClick={returnToAdminClick}
                            className="flex-grow-1 flex-sm-grow-0"
                        >
                            {t("RETURN_TO_ADMIN")}
                        </Button> : */}

                {
                    currentUser === "FI_USER" &&
                    <div className="custom-min-width-120 flex-grow-1 flex-md-grow-0">
                        <ReactSelect
                            wrapperClassName="mb-0"
                            class="form-select "
                            placeholder={t("CLAIM_TYPE")}
                            id="floatingSelect"
                            size="sm"
                            options={[
                                {
                                    label: t("CLAIM_TYPE"),
                                    value: "",
                                },
                                ...claimTypes
                            ]}
                            onChange={(e) => {
                                setFilter({
                                    ...filter,
                                    claimTypeId: e.target.value,
                                });
                            }}
                            value={filter?.claimTypeId}
                        />
                    </div>
                }

                {
                    currentUser !== "FI_USER" &&
                    <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                        <ReactSelect
                            wrapperClassName="mb-0"
                            class="form-select "
                            placeholder={t("PRIORITY")}
                            id="floatingSelect"
                            size="sm"
                            options={priorityDropdwonData ?? []}
                            onChange={(e) => {
                                setFilter({
                                    ...filter,
                                    claimTicketPriority: e.target.value,
                                });
                            }}
                            value={filter?.claimTicketPriority}
                        />
                    </div>
                }
                {
                    currentUser !== "FI_USER" && <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                        <ReactSelect
                            wrapperClassName="mb-0"
                            class="form-select "
                            placeholder={t("INSTANCE_TYPE")}
                            id="floatingSelect"
                            size="sm"
                            options={instanceTypeDropdown ?? []}
                            onChange={(e) => {
                                setFilter({
                                    ...filter,
                                    instanceType: e.target.value,
                                });
                            }}
                            value={filter?.instanceType}
                        />
                    </div>
                }


                <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                    <ReactSelect
                        wrapperClassName="mb-0"
                        class="form-select "
                        placeholder={t("ALL STATUS")}
                        id="floatingSelect"
                        size="sm"
                        options={statusDropdownData ?? []}
                        onChange={(e) => {
                            setFilter({
                                ...filter,
                                claimTicketStatus: e.target.value,
                            });
                        }}
                        value={filter?.claimTicketStatus}
                    />
                </div>
                <Stack direction="horizontal" gap={2} className="gap-md-3 flex-wrap">
                    {/* DATE RANGE FILTER */}
                    <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                        <CustomDateRangePicker
                            wrapperClassName="mb-0"
                            tempDateRange={tempDateRange}
                            handleChange={handleDateFilterChange}
                            startDate={filter?.startDate ?? null}
                            endDate={filter?.endDate ?? null}
                            selectsRange={true}
                            placeholder={t("SELECT_DATE_RANGE")}
                            size="sm"
                            maxDate={new Date()} // Prevent future date selection
                        />
                    </div>
                </Stack>
            </Stack>

        </div>

    );
};

export default TicketsListFilters;