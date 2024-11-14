import React from "react";
import { Button, Dropdown, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdOutlineFilterAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import FormInput from "../../../../components/FormInput";
import ReactSelect from "../../../../components/ReactSelect";
import AppTooltip from "../../../../components/tooltip";

const TicketsListFilters = ({ filter, setFilter, returnToAdminClick, filterByClaimFill, filterBySla }) => {
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
                    <Button
                        type="button"
                        variant="warning"
                        onClick={returnToAdminClick}
                    >
                        Return to Admin
                    </Button>
                    <div className="custom-min-width-100 flex-grow-1 flex-md-grow-0">
                        <ReactSelect
                            wrapperClassName="mb-0"
                            class="form-select "
                            placeholder="Claim Type"
                            id="floatingSelect"
                            size="sm"
                            options={[
                                {
                                    label: "Claim Type",
                                    value: "",
                                },
                                {
                                    label: "Option 1",
                                    value: 'option-1',
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

                    <Dropdown>
                        <Dropdown.Toggle
                            variant="link"
                            id="filter-dropdown"
                            className="link-dark p-1 ms-n1 hide-dropdown-arrow"
                        >
                            <AppTooltip title="Filters" placement="top">
                                <span><MdOutlineFilterAlt size={20} /></span>
                            </AppTooltip>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-lg rounded-3 border-0 mt-1">
                            <Dropdown.Item className="small" as={Link} onClick={filterByClaimFill}>
                                Claim Filled By
                            </Dropdown.Item>
                            <Dropdown.Item className="small" as={Link} onClick={filterBySla}>
                                SLA
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Stack>
            </Stack>
        </div>
    );
};

export default TicketsListFilters;