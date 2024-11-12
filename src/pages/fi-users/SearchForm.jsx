import React, { useEffect, useState } from "react";
import { Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/FormInput";
import ReactSelect from "../../components/ReactSelect";
import { getRolesDropdownData } from "../../services/rolerights.service";
import toast from "react-hot-toast";

const SearchForm = ({ filter, setFilter }) => {
  const { t } = useTranslation();

  const [rolesDropdownData, setRolesDropdownData] = useState([])

  //FETCH ROLES DROPDOWN DATA
  const fetchRolesDropdownData = () => {
    getRolesDropdownData('FI_USER').then((response) => {
      const mappedData = [
        { label: "All Roles", value: "" },
        ...(response?.data?.map(item => ({
          value: item.id,
          label: item.name
        })) || [])
      ];
      setRolesDropdownData(mappedData ?? [])
    })
      .catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message);
        }
      })
  }

  useEffect(() => {
    fetchRolesDropdownData()
  }, [])


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
              placeholder={t("SELECT ROLE")}
              id="floatingSelect"
              options={rolesDropdownData ?? []}
              size="sm"
              onChange={(e) => {
                setFilter({
                  ...filter,
                  roleId: e.target.value,
                });
              }}
              value={filter?.roleId}
            />
          </div>
        </Stack>
        <Stack direction="horizontal" gap={2} className="gap-md-3 flex-wrap flex-grow-1 flex-sm-grow-0">
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              class="form-select "
              placeholder={t("ALL STATUS")}
              size="sm"
              id="floatingSelect"
              options={[
                {
                  label: t("ALL STATUS"),
                  value: "",
                  class: "label-class",
                },
                {
                  label: t("ACTIVE"),
                  value: "ACTIVE",
                },
                {
                  label: t("PENDING"),
                  value: "PENDING",
                },
                {
                  label: t("BLOCKED"),
                  value: "BLOCKED",
                },
                {
                  label: t("DELETED"),
                  value: "DELETED",
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

export default SearchForm;
