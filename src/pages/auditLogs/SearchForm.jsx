import React from "react";
import { Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/FormInput";
import ReactSelect from "../../components/ReactSelect";
import { AUDIT_TRAIL_ACTIVITY } from "../../constants/dropdownData";

const SearchForm = ({ filter, setFilter }) => {
  const { t } = useTranslation();

  const { i18n } = useTranslation();

  const activityTypeOptions = AUDIT_TRAIL_ACTIVITY.map(activity => ({
      label: activity.label[i18n.language] || activity.label.en, // fallback to English if language not available
      value: activity.value
  }));

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
        </Stack>
      </Stack>
    </div>
  );
};

export default SearchForm;
