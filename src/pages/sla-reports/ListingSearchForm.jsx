import React, { useEffect, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/FormInput";
import ReactSelect from "../../components/ReactSelect";
import moment from "moment/moment";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import { claimSubTypeDropdownList, claimTypesDropdownList, getClaimSubTypeById } from "../../services/claimSubType.service";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";
import AppTooltip from "../../components/tooltip";
import { MdOutlineFilterAlt } from "react-icons/md";
import { LuFilterX } from "react-icons/lu";

const ListingSearchForm = ({ filter, setFilter }) => {
  const [tempDateRange, setTempDateRange] = useState([null, null]);
  const [claimTypes, setClaimTypes] = useState([]);
  const [claimSubTypes, setClaimSubTypes] = useState([]);

  const { t } = useTranslation();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const toggleFilterModal = () => { setIsFilterModalOpen(!isFilterModalOpen) }

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
      const response = await claimSubTypeDropdownList(claimTypeId);

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
    setFilter((prevfilter) => ({ ...prevfilter, claimTypeId: claimTypeId }))
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
          <Button size="sm" type="button" variant="warning" onClick={() => {
            setFilter({
              search: "",
              status: "",
              claimTypeId: "",
              claimSubTypeId: "",
              slaCompliance: "",
              startDate: null,
              endDate: null,
              instanceType: "",
              organizationId: "",
              claimTicketPriority: ""
            })
          }}>
            <LuFilterX size={18} />  {t("RESET")}
          </Button>
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              placeholder={t("CLAIM TYPE")}
              options={[{ label: t('SELECT'), value: '' }, ...claimTypes]}
              size="sm"
              onChange={handleClaimTypeChange}
              value={filter?.claimTypeId}
            />
          </div>
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              placeholder={t("CLAIM SUB TYPE")}
              options={claimSubTypes}
              size="sm"
              onChange={(selectedOption) => updateFilter("claimSubTypeId", selectedOption?.target?.value || "")}
              value={filter?.claimSubTypeId ?? ''}
              isDisabled={!filter.claimTypeId}
            />
          </div>
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              placeholder={t("SLA COMPLIANCE")}
              size="sm"
              options={[
                { label: t("ALL_COMPLIANCES"), value: "" },
                { label: t("COMPLAINT"), value: "COMPLAINT" },
                { label: t("NON_COMPLAINT"), value: "NON_COMPLIANT" },
              ]}
              onChange={(selectedOption) => updateFilter("slaCompliance", selectedOption?.target?.value || "")}
              value={filter?.slaCompliance}
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
              placeholder={t("SELECT_DATE_RANGE")}
              size="sm"
            />
          </div>
          <Button
            variant="link"
            id="filter-dropdown"
            className="link-dark p-1 ms-n1 hide-dropdown-arrow"
            onClick={toggleFilterModal}
          >
            <AppTooltip title="Filters" placement="top">
              <span><MdOutlineFilterAlt size={20} /></span>
            </AppTooltip>
          </Button>
        </Stack>
      </Stack>

      <FilterModal modal={isFilterModalOpen} toggle={toggleFilterModal} filter={filter} setFilter={setFilter} />
    </div>
  );
};

export default ListingSearchForm;
