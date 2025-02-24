import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CustomDateRangePicker from "../../../../../components/CustomDateRangePicker";
import FormInput from "../../../../../components/FormInput";
import ReactSelect from "../../../../../components/ReactSelect";
import { MasterDataContext } from "../../../../../contexts/masters.context";
import { convertToLabelValue } from "../../../../../services/ticketmanagement.service";
import { LuFilterX } from "react-icons/lu";

const DashboardListFilters = ({ filter, setFilter }) => {
    const { t } = useTranslation();

    // Temporary state to hold the selected dates
    const [tempDateRange, setTempDateRange] = useState([null, null]);
    const [statusDropdownData, setStatusDropdownData] = useState([])
    const { masterData } = useContext(MasterDataContext)

    const handleDateFilterChange = ([newStartDate, newEndDate]) => {
        setTempDateRange([newStartDate, newEndDate]);

        // Update filter state only if both dates are selected
        if (newStartDate && newEndDate) {
            setFilter({
                startDate: moment(newStartDate).format("YYYY-MM-DD"),
                endDate: moment(newEndDate).format("YYYY-MM-DD")
            });
        }else if(filter?.startDate && filter?.endDate){
            setFilter((prevFilters) => {
                const { startDate, endDate, ...restFilters } = prevFilters;
                return { ...restFilters };
            });
        }
    };



    useEffect(() => {
        if (masterData?.claimTicketStatus) {
            setStatusDropdownData([{ select: '', label: t('ALL STATUS') }, ...convertToLabelValue(masterData?.claimTicketStatus)])
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
                        value={filter.search}
                    />
                </div>
                <Button size="sm" type="button" variant="warning" onClick={() => {
                        setFilter({
                            search: "",
                            claimTicketStatus: "",
                            instanceType:"",
                            startDate: null,
                            endDate: null
                        })
                        setTempDateRange([null,null])
                    }}>
                        <LuFilterX size={18} />  {t("RESET")}
                    </Button>
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
                            endDate={filter?.endDate}
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

export default DashboardListFilters;