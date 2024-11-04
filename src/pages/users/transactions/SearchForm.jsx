import React from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import FormInput from "../../../components/FormInput";
import { HiMiniUsers } from 'react-icons/hi2';
import ReactSelect from '../../../components/ReactSelect';
import DateRangePicker from '../../../components/DateRangePicker';

const SearchForm = ({ filter, setFilter }) => {
    return (
        <div className="theme-card-header px-1">
            <Stack
                gap={3}
                className="flex-wrap px-3 pt-3 pb-2 align-items-start"
            >
                <h5 className="mb-0 position-relative fw-semibold fs-16">
                    <div className="align-items-center bg-info d-inline-flex custom-height-60 justify-content-center position-absolute rounded start-0 text-white theme-icon-box custom-width-60 z-1">
                        <HiMiniUsers size={32} />
                    </div>
                    Transaction History
                </h5>
                <div className="w-100">
                    <Row className="g-3">
                        <Col md={4} className="d-flex">
                            <div className="custom-width-250 flex-grow-1 flex-md-grow-0">
                                <FormInput

                                    id="search"
                                    key={"search"}
                                    //label="Search"
                                    name="search"
                                    //onBlur={handleBlur}
                                    //  onChange={handleChange}
                                    placeholder="Search"
                                    //  touched={touched.email}
                                    type="text"
                                    onChange={(event) => {
                                        if (
                                            event.target
                                                .value ===
                                            ""
                                        ) {
                                            setFilter({
                                                ...filter,
                                                search: undefined,
                                            });
                                            return;
                                        }
                                        setFilter({
                                            ...filter,
                                            search: event
                                                .target
                                                .value,
                                        });
                                    }}
                                    value={filter.search}

                                />
                            </div>
                        </Col>
                        <Col>
                            <Row className="g-2 justify-content-end align-items-baseline">
                                <Col
                                    sm
                                    md="auto"
                                    className="d-flex"
                                >

                                    <div className="custom-width-150 flex-grow-1 flex-md-grow-0">
                                        <div class="form-floating">
                                            <ReactSelect
                                                label={"Transaction Type"}
                                                class="form-select "
                                                placeholder="Subscription"
                                                id="floatingSelect"
                                                aria-label="Floating label select example"

                                                options={[

                                                ]}
                                                onChange={(
                                                    e
                                                ) => {
                                                    setFilter({
                                                        ...filter,
                                                        status: e
                                                            .target
                                                            .value,
                                                    });
                                                }}
                                                value={
                                                    filter.status
                                                }
                                            />


                                        </div>
                                    </div>
                                </Col>


                                <Col
                                    sm
                                    md="auto"
                                    className="d-flex"
                                >
                                    <div className="custom-width-150 flex-grow-1 flex-md-grow-0">
                                        <DateRangePicker

                                            endDate={
                                                filter.endDate
                                            }
                                            startDate={
                                                filter.startDate
                                            }
                                            onChange={([
                                                startDate,
                                                endDate,
                                            ]) => {
                                                setFilter({
                                                    ...filter,
                                                    startDate,
                                                    endDate,
                                                });
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col
                                    sm
                                    md="auto"
                                    className="d-flex mb-3"
                                >
                                    <Button
                                        className="fw-semibold mw-44"
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setFilter({
                                                search: "",
                                                subscription:
                                                    "free",
                                                status: "all",
                                            });
                                        }}
                                    >
                                        Clear Filter
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Stack>
        </div>
    );
};

export default SearchForm;
