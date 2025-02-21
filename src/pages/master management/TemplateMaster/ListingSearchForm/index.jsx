import React, { useContext } from "react";
import { Button, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../../../components/FormInput";
import ReactSelect from "../../../../components/ReactSelect";
import { LuFilterX } from "react-icons/lu";
import { AuthenticationContext } from "../../../../contexts/authentication.context";

const ListingSearchForm = ({ filter, setFilter, hideFilter }) => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthenticationContext)
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
            <Button size="sm" type="button" variant="warning" onClick={() => {
              setFilter({
                search: "",
                status: "",
                templateType: ""
              })
            }}>
              <LuFilterX size={18} />  {t("RESET")}
            </Button>

            {
              currentUser !== 'FI_USER' &&
              <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
                <ReactSelect
                  wrapperClassName="mb-0"
                  class="form-select "
                  placeholder={t("TEMPLATE TYPE")}
                  id="floatingSelect"
                  size="sm"
                  options={[
                    {
                      label: t("ALL TEMPLATES"),
                      value: "",
                      class: "label-class",
                    },
                    {
                      label: t("EMAIL"),
                      value: "EMAIL",
                    },
                    {
                      label: t("NOTIFICATION"),
                      value: "NOTIFICATION",
                    },
                  ]}
                  onChange={(e) => {
                    setFilter({
                      ...filter,
                      templateType: e.target.value,
                    });
                  }}
                  value={filter.status}
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
