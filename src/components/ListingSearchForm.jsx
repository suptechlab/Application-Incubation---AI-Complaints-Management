import React from "react";
import { Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../components/FormInput";
import ReactSelect from "./ReactSelect";

const ListingSearchForm = ({ filter, setFilter }) => {
  const { t } = useTranslation();
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
                  label: t("ACTIVE"),
                  value: 'ACTIVE',
                },
                {
                  label: t("INACTIVE"),
                  value: 'BLOCKED',
                },
              ]}
              onChange={(e) => {
                setFilter({
                  ...filter,
                  status: e.target.value,
                });
              }}
              value={filter.status}
            />
          </div>
        </Stack>
      </Stack>
    </div>
  );
};

export default ListingSearchForm;
