import React, { useContext, useEffect, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/FormInput";
import ReactSelect from "../../components/ReactSelect";
import { getRolesDropdownData } from "../../services/rolerights.service";
import toast from "react-hot-toast";
import { LuFilterX } from "react-icons/lu";
import { getOrganizationList } from "../../services/teamManagment.service";
import { AuthenticationContext } from "../../contexts/authentication.context";

const SearchForm = ({ filter, setFilter }) => {
  const { t } = useTranslation();

  const {currentUser} = useContext(AuthenticationContext)

  const [rolesDropdownData, setRolesDropdownData] = useState([])
  const [organizationOption, setOrganizationOptions] = useState([])

  // GET ORGANIZATION DROPDOWN LIST
  const getOrganizationDropdownList = () => {
    getOrganizationList().then(response => {
      if (response?.data && response?.data?.length > 0) {
        const dropdownData = response?.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setOrganizationOptions(dropdownData)
      }
    }).catch((error) => {
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH CLAIM TYPE DATA");
      }
    })
  }

  //FETCH ROLES DROPDOWN DATA
  const fetchRolesDropdownData = () => {
    getRolesDropdownData('FI_USER').then((response) => {
      const mappedData = [
        { label: t("ALL_ROLES"), value: "" },
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
    getOrganizationDropdownList()
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
          <Button size="sm" type="button" variant="warning" onClick={() => {
            setFilter({
              search: "",
              status: "",
              roleId: "",
              organizationId:""
            })
          }}>
            <LuFilterX size={18} />  {t("RESET")}
          </Button>
          {
            currentUser !=='FI_USER' &&<div className="custom-max-width-320 custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              className="form-select "
              size="sm"
              placeholder={t("ALL_ENTITIES")}
              options={[
                { label: t("ALL_ENTITIES"), value: "" },
                ...organizationOption.map((group) => ({
                  label: group.label,
                  value: group.value,
                })),
              ]}
              value={filter.organizationId}
              onChange={(e) => {
                setFilter({
                  ...filter,
                  organizationId: e.target.value,
                });
              }}
              name="organizationId"
            />
          </div>
          }
          
          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              className="form-select "
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

          <div className="custom-min-width-160 flex-grow-1 flex-md-grow-0">
            <ReactSelect
              wrapperClassName="mb-0"
              className="form-select"
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
                // {
                //   label: t("PENDING"),
                //   value: "PENDING",
                // },
                {
                  label: t("INACTIVE"),
                  value: "BLOCKED",
                },
                // {
                //   label: t("DELETED"),
                //   value: "DELETED",
                // },
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
