import React, { useEffect, useState } from "react";
import { Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/FormInput";
import ReactSelect from "../../components/ReactSelect";
import moment from "moment/moment";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import { claimTypesDropdownList, getClaimSubTypeById } from "../../services/claimSubType.service";
import toast from "react-hot-toast";

const ListingSearchForm = ({ filter, setFilter }) => {
  const [tempDateRange, setTempDateRange] = useState([null, null]);
  const [claimTypes, setClaimTypes] = useState([]);
  const [claimSubTypes, setClaimSubTypes] = useState([]);

  const { t } = useTranslation();

  // Fetch Claim Types
  const fetchClaimTypes = async () => {
    try {
      const response = await claimTypesDropdownList();
      if (response?.data?.length > 0) {
        const dropdownData = response.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));
        setClaimTypes(dropdownData);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.errorDescription ?? error.message ?? "Failed to fetch claim type data"
      );
    }
  };

  // Fetch Claim Sub-Types
  const fetchClaimSubTypes = async (claimTypeId) => {

    try {
      const response = await claimTypesDropdownList(claimTypeId);

      console.log(response?.data?.length > 0)
      if (response?.data?.length > 0) {
        const dropdownData = response.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));
        setClaimSubTypes(dropdownData);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.errorDescription ?? error.message ?? "Failed to fetch claim sub-type data"
      );
    }
  };

  // Update Filters
  const updateFilter = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  // Effect to fetch claim types
  useEffect(() => {
    fetchClaimTypes();
  }, []);

  const handleClaimTypeChange = (selectedOption) => {
    const claimTypeId = selectedOption?.target?.value ?? "";
    updateFilter("claimTypeId", claimTypeId);
    updateFilter("claimSubTypeId", ""); // Clear sub-type filter when claim type changes
    console.log({ claimType: claimTypeId })
    if (claimTypeId) {
      fetchClaimSubTypes(claimTypeId);
    } else {
      setClaimSubTypes([]);
    }
  };

  return (
    <div className="theme-card-header header-search mb-3">
      <Stack direction="horizontal" gap={2} className="flex-wrap">
        <div className="custom-width-200 flex-grow-1 flex-sm-grow-0 me-auto">
          <FormInput
            wrapperClassName="mb-0"
            id="search"
            name="search"
            placeholder={t("SEARCH")}
            type="text"
            size="sm"
            onChange={(e) => updateFilter("search", e.target.value || undefined)}
            value={filter.search || ""}
          />
        </div>

        <Stack direction="horizontal" gap={2} className="gap-md-3 flex-wrap flex-grow-1 flex-sm-grow-0">
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              placeholder={t("CLAIM TYPE")}
              options={claimTypes}
              size="sm"
              onChange={handleClaimTypeChange}
              value={claimTypes.find((option) => option.value === filter.claimTypeId) || null}
            />
          </div>
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              placeholder={t("CLAIM SUB TYPE")}
              options={claimSubTypes}
              size="sm"
              onChange={(selectedOption) => updateFilter("claimSubTypeId", selectedOption?.value || "")}
              value={claimSubTypes.find((option) => option.value === filter.claimSubTypeId) || null}
              isDisabled={!filter.claimTypeId}
            />
          </div>
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              placeholder={t("STATUS")}
              size="sm"
              options={[
                { label: t("ALL STATUS"), value: "" },
                { label: t("ACTIVE"), value: true },
                { label: t("INACTIVE"), value: false },
              ]}
              onChange={(selectedOption) => updateFilter("status", selectedOption?.value || "")}
              value={[
                { label: t("ALL STATUS"), value: "" },
                { label: t("ACTIVE"), value: true },
                { label: t("INACTIVE"), value: false },
              ].find((option) => option.value === filter.status) || null}
            />
          </div>
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <CustomDateRangePicker
              wrapperClassName="mb-0"
              tempDateRange={tempDateRange}
              handleChange={(dates) => {
                setTempDateRange(dates);
                const [startDate, endDate] = dates;
                if (startDate && endDate) {
                  updateFilter("startDate", moment(startDate).format("YYYY-MM-DD"));
                  updateFilter("endDate", moment(endDate).format("YYYY-MM-DD"));
                }
              }}
              startDate={filter.startDate || null}
              endDate={filter.endDate || null}
              selectsRange
              placeholder="Select Date Range"
              size="sm"
            />
          </div>
        </Stack>
      </Stack>
    </div>
  );
};

export default ListingSearchForm;
