import React, { useState } from "react";
import { Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/FormInput";
import ReactSelect from "../../components/ReactSelect";
import { AUDIT_TRAIL_ACTIVITY } from "../../constants/dropdownData";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import moment from "moment";


const SearchForm = ({ filter, setFilter }) => {
  const { t } = useTranslation();

  const { i18n } = useTranslation();

  const activityTypeOptions = AUDIT_TRAIL_ACTIVITY.map(activity => ({
    label: activity.label[i18n.language] || activity.label.en, // fallback to English if language not available
    value: activity.value
  }));


  const [dateFilter , setDateFilter] = useState({startDate : '' , endDate : ''})

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
    <div className="theme-card-header header-search mb-3">
      <Stack direction="horizontal" gap={2} className="flex-wrap">
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

        <Stack direction="horizontal" gap={2} className="gap-md-3 flex-wrap flex-grow-1 flex-sm-grow-0">
          {/* ACTIVITY FILTER DROPDOWN */}
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              class="form-select "
              placeholder={t("ALL ACTIVITIES")}
              id="floatingSelect"
              options={activityTypeOptions ?? []}
              size="sm"
              onChange={(e) => {
                setFilter({
                  ...filter,
                  activityType: e.target.value,
                });
              }}
              value={filter.activityType}
            />
          </div>
          {/* DATE RANGE FILTER */}

          <CustomDateRangePicker tempDateRange ={tempDateRange} handleChange={handleDateFilterChange} startDate={filter?.startDate ?? null} endDate={filter?.endDate}/>
        
        
        </Stack>
      </Stack>
    </div>
  );
};

export default SearchForm;
