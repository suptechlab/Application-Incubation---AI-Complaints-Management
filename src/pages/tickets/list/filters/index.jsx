import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button, Dropdown, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdOutlineFilterAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import CustomDateRangePicker from "../../../../components/CustomDateRangePicker";
import FormInput from "../../../../components/FormInput";
import ReactSelect from "../../../../components/ReactSelect";
import AppTooltip from "../../../../components/tooltip";
import { claimTypesDropdownList } from "../../../../services/claimSubType.service";
import toast from "react-hot-toast";
import { agentListingApi } from "../../../../services/ticketmanagement.service";

const TicketsListFilters = ({ filter, setFilter, returnToAdminClick, filterByClaimFill, filterBySla }) => {
    const { t } = useTranslation();
    const [claimTypes , setClaimTypes] =useState([])
    const [agentList, setAgentListing] = useState([])
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
            console.log({agent : response})
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
        getClaimTypeDropdownList()
        getAgentDropdownListing()
    }, [])

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
                        value={filter.search}
                    />
                </div>
                {/* <Button
                    type="button"
                    variant="warning"
                    onClick={returnToAdminClick}
                    className="flex-grow-1 flex-sm-grow-0"
                >
                    Return to Admin
                </Button> */}
                {/* <div className="custom-min-width-120 flex-grow-1 flex-md-grow-0">
                    <ReactSelect
                        wrapperClassName="mb-0"
                        class="form-select "
                        placeholder="Claim Type"
                        id="floatingSelect"
                        size="sm"
                        options={[
                            {
                                label: "Claim Type",
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
                </div> */}
                <div className="custom-min-width-120 flex-grow-1 flex-md-grow-0">
                    <ReactSelect
                        wrapperClassName="mb-0"
                        class="form-select "
                        placeholder="Assign/Reassign"
                        id="floatingSelect"
                        size="sm"
                        options={[
                            {
                                label: "Select",
                                value: "",
                            },
                            ...agentList
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
                <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                    <ReactSelect
                        wrapperClassName="mb-0"
                        class="form-select "
                        placeholder={t("PRIORITY")}
                        id="floatingSelect"
                        size="sm"
                        options={[
                            {
                                label: t("PRIORITY"),
                                value: "",
                                class: "label-class",
                            },
                            {
                                label: t("LOW"),
                                value: "LOW",
                            },
                            {
                                label: t("MEDIUM"),
                                value: "MEDIUM",
                            },
                            {
                                label: t("HIGH"),
                                value: "HIGH",
                            }
                        ]}
                        onChange={(e) => {
                            setFilter({
                                ...filter,
                                claimTicketPriority: e.target.value,
                            });
                        }}
                        value={filter?.claimTicketPriority}
                    />
                </div>
                <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                    <ReactSelect
                        wrapperClassName="mb-0"
                        class="form-select "
                        placeholder={t("ALL STATUS")}
                        id="floatingSelect"
                        size="sm"
                        options={[
                            {
                                label: t("ALL STATUS"),
                                value: "",
                                class: "label-class",
                            },
                            {
                                label: t("NEW"),
                                value: "NEW",
                            },
                            {
                                label: t("ASSIGNED"),
                                value: "ASSIGNED",
                            },
                            {
                                label: t("IN_PROGRESS"),
                                value: "IN_PROGRESS",
                            },
                            {
                                label: t("PENDING"),
                                value: "PENDING",
                            },
                            {
                                label: t("REJECTED"),
                                value: "REJECTED",
                            },
                            {
                                label: t("CLOSED"),
                                value: "CLOSED",
                            },
                        ]}
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
                            endDate={filter?.endDate}
                            selectsRange={true}
                            placeholder="Select Date Range"
                            size="sm"
                        />
                    </div>

                    {/* Dropdown FILTER */}
                    <Dropdown>
                        <Dropdown.Toggle
                            variant="link"
                            id="filter-dropdown"
                            className="link-dark p-1 ms-n1 hide-dropdown-arrow"
                        >
                            <AppTooltip title="Filters" placement="top">
                                <span><MdOutlineFilterAlt size={20} /></span>
                            </AppTooltip>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-lg rounded-3 border-0 mt-1">
                            <Dropdown.Item className="small" as={Link} onClick={filterByClaimFill}>
                                Claim Filled By
                            </Dropdown.Item>
                            <Dropdown.Item className="small" as={Link} onClick={filterBySla}>
                                SLA
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Stack>
            </Stack>
        </div>
    );
};

export default TicketsListFilters;