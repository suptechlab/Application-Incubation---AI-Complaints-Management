import React, { useEffect, useState } from "react";
import { Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../../components/FormInput";
import ReactSelect from "../../../components/ReactSelect";
import { getOrganizationList } from "../../../services/teamManagment.service";

const ListingSearchForm = ({ filter, setFilter, hideFilter }) => {
  const { t } = useTranslation();

  const [organizationArr, setOrganizationArr] = useState([])


  const getOrganizationLists = async () => {
    try {
      await getOrganizationList().then((response) => {
        const formattedOrgData = response.data.map((item) => ({
          label: item.name,
          value: item.id
        }));
        setOrganizationArr([...formattedOrgData]);
      });
    } catch (error) {
    }
  }


  useEffect(() => {
    getOrganizationLists()
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
        {!hideFilter &&
          <Stack direction="horizontal" gap={2} className="gap-md-3 flex-wrap flex-grow-1 flex-sm-grow-0">
            <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
              <ReactSelect
                wrapperClassName="mb-0"
                class="form-select "
                placeholder={t("ENTITY NAME")}
                id="floatingSelect"
                size="sm"
                options={organizationArr ?? []}
                onChange={(e) => {
                  setFilter({
                    ...filter,
                    organizationId: e.target.value,
                  });
                }}
                value={filter.organizationId}
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
                    label: t("ACTIVE"),
                    value: true,
                  },
                  {
                    label: t("INACTIVE"),
                    value: false,
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
        }
      </Stack>
    </div>
  );
};

export default ListingSearchForm;
